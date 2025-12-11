import React, { useState, useEffect, useCallback } from 'react';
import { H2Section } from '../types';
import { generateImage, generateBackgroundInstruction, checkForTextInImage } from '../services/geminiService';
import { ensure16x9 } from '../services/imageProcessor';

interface H2ProcessingCardProps {
    section: H2Section;
    updateSection: (section: H2Section) => void;
    startProcessing: boolean;
    onProcessingComplete: () => void;
    availableImages?: Array<{name: string; base64: string}>;  // 利用可能な画像リスト
}

export const H2ProcessingCard: React.FC<H2ProcessingCardProps> = ({ section, updateSection, startProcessing, onProcessingComplete, availableImages }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editablePrompt, setEditablePrompt] = useState(
        section.prompt + (section.backgroundInstruction ? `\n- **背景の指定:** ${section.backgroundInstruction}` : '')
    );

    const handleGenerate = useCallback(async () => {
        if (!section.baseImage) {
            updateSection({ ...section, status: 'error', errorMessage: "No base image selected." });
            onProcessingComplete();
            return;
        }

        const isFirstGeneration = section.status === 'pending';
        updateSection({ ...section, status: 'generating', errorMessage: null, generationStep: 'Starting...' });

        try {
            let currentPrompt = editablePrompt;
            let finalBgInstruction = section.backgroundInstruction;

            if (isFirstGeneration) {
                updateSection({ ...section, status: 'generating', generationStep: 'Generating background suggestion...' });
                try {
                    finalBgInstruction = await generateBackgroundInstruction(section.h2Text, section.paragraphText);
                    currentPrompt = `${editablePrompt}\n- **背景の指定:** ${finalBgInstruction}`;
                    setEditablePrompt(currentPrompt);
                } catch (error) {
                    console.error("Failed to generate background", error);
                }
            }

            let generatedImgB64: string | null = null;
            const MAX_ATTEMPTS = 2; // Initial attempt + 1 retry

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                let attemptPrompt = editablePrompt;
                if (attempt > 1) {
                    attemptPrompt += "\n\n**重要:** 生成するイラストには、いかなる文字、ロゴ、署名、透かしも絶対に含めないでください。";
                    updateSection({ ...section, status: 'generating', generationStep: `Text detected, retrying... (Attempt ${attempt}/${MAX_ATTEMPTS})` });
                } else {
                     updateSection({ 
                        ...section, 
                        status: 'generating',
                        prompt: attemptPrompt,
                        backgroundInstruction: finalBgInstruction,
                        generationStep: `Generating image... (Attempt ${attempt}/${MAX_ATTEMPTS})` 
                    });
                }
                
                const rawGeneratedImg = await generateImage(section.baseImage, attemptPrompt);
                
                updateSection({ ...section, status: 'generating', prompt: attemptPrompt, backgroundInstruction: finalBgInstruction, generationStep: 'Verifying image (checking for text)...' });
                const hasText = await checkForTextInImage(rawGeneratedImg);

                if (hasText) {
                    // テキストが検出された場合、除去を試みる
                    console.warn(`🔤 テキスト検出 [H2 #${section.id}] 試行 ${attempt}/${MAX_ATTEMPTS}`, {
                        h2Text: section.h2Text,
                        action: 'テキスト除去を試行',
                        timestamp: new Date().toISOString()
                    });
                    
                    updateSection({ ...section, status: 'generating', generationStep: `Removing detected text... (Attempt ${attempt}/${MAX_ATTEMPTS})` });
                    
                    // テキスト除去を試行
                    const cleanedImg = await generateImage(
                        rawGeneratedImg,
                        "Remove all text, letters, numbers, and written symbols from this image while keeping everything else exactly the same. Maintain the original style, colors, composition, and all visual elements except text."
                    );
                    
                    // 再度テキストチェック
                    updateSection({ ...section, status: 'generating', generationStep: 'Verifying text removal...' });
                    const stillHasText = await checkForTextInImage(cleanedImg);
                    
                    if (!stillHasText) {
                        console.log(`✅ テキスト除去成功 [H2 #${section.id}]`, {
                            h2Text: section.h2Text,
                            timestamp: new Date().toISOString()
                        });
                        generatedImgB64 = cleanedImg;
                        break; // Success: Text removed successfully
                    } else {
                        console.warn(`⚠️ テキスト除去失敗 [H2 #${section.id}]`, {
                            h2Text: section.h2Text,
                            willRetry: attempt < MAX_ATTEMPTS,
                            timestamp: new Date().toISOString()
                        });
                        // テキスト除去に失敗した場合、元の画像を保持
                        generatedImgB64 = rawGeneratedImg;
                        // 次の試行へ（MAX_ATTEMPTSまで）
                    }
                } else {
                    // テキストが検出されなかった場合
                    console.log(`✨ テキストなし - クリーンな画像 [H2 #${section.id}]`, {
                        h2Text: section.h2Text,
                        attempt: attempt,
                        timestamp: new Date().toISOString()
                    });
                    generatedImgB64 = rawGeneratedImg;
                    break; // Success: Image is clean, exit the loop.
                }
            }
            
            if (!generatedImgB64) {
                 throw new Error("Image generation failed unexpectedly and produced no image.");
            }

            updateSection({ ...section, status: 'generating', generationStep: 'Finalizing image format...' });
            const finalImage = await ensure16x9(generatedImgB64, 1920, 1080);
            
            const simulatedMediaId = Math.floor(Math.random() * 1000) + 1;
            const simulatedUrl = `https://your-site.com/wp-content/uploads/2024/h2_${section.id}.jpg`;
            
            updateSection({ 
                ...section, 
                prompt: currentPrompt,
                backgroundInstruction: finalBgInstruction,
                status: 'success', 
                generatedImage: finalImage, 
                mediaId: simulatedMediaId, 
                sourceUrl: simulatedUrl,
                generationStep: null,
                errorMessage: null,
            });

        } catch (error: any) {
            // エラーログの詳細出力
            console.error('❌ 画像生成エラー発生:');
            console.error('  - H2タイトル:', section.h2Text);
            console.error('  - セクションID:', section.id);
            console.error('  - エラーメッセージ:', error?.message || 'Unknown error');
            console.error('  - エラータイプ:', error?.name || 'UnknownError');
            console.error('  - ステータスコード:', error?.status || error?.response?.status || 'Unknown');
            console.error('  - 現在のプロンプト長:', editablePrompt?.length || 0);
            console.error('  - ベース画像名:', section.baseImageName);
            console.error('  - タイムスタンプ:', new Date().toISOString());
            console.error('  - 完全なエラー:', error);

            // 500エラーの場合の追加情報
            if (error?.status === 500 || error?.response?.status === 500) {
                console.error('🔍 500エラー追加診断:');
                console.error('  - このセクションでの生成試行回数を確認してください');
                console.error('  - プロンプトに特殊文字が含まれている可能性があります');
                console.error('  - Gemini APIのレート制限に達している可能性があります');
                console.error('  - 数秒待ってから再試行することを推奨します');
            }

            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            updateSection({ ...section, status: 'error', errorMessage, prompt: editablePrompt, generationStep: null });
        } finally {
            if (isFirstGeneration) {
                onProcessingComplete();
            }
        }
    }, [section, updateSection, onProcessingComplete, editablePrompt]);

    useEffect(() => {
        if (startProcessing && section.status === 'pending') {
            handleGenerate();
        }
    }, [startProcessing, section.status, handleGenerate]);


    const getStatusColor = () => {
        switch (section.status) {
            case 'pending': return 'bg-gray-200 text-gray-700';
            case 'generating': return 'bg-blue-200 text-blue-800 animate-pulse';
            case 'success': return 'bg-green-200 text-green-800';
            case 'error': return 'bg-red-200 text-red-800';
        }
    };
    
    const isGenerated = section.status === 'success' || section.status === 'error';
    const buttonText = section.status === 'generating' ? 'Generating...' : isGenerated ? 'Regenerate Image' : 'Generate Image';


    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-1">
                    <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>{section.status}</span>
                        <h3 className="ml-3 text-lg font-semibold text-gray-800">{section.h2Text}</h3>
                    </div>
                </div>
                <button
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    {isExpanded ? 'Collapse' : 'Expand'}
                </button>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Details</h4>
                        <div className="text-sm space-y-3">
                            <div>
                                <p className="font-medium text-gray-600 mb-1">Base Image:</p>
                                {availableImages && availableImages.length > 0 ? (
                                    <select
                                        value={section.baseImageName}
                                        onChange={(e) => {
                                            const selectedImage = availableImages.find(img => img.name === e.target.value);
                                            if (selectedImage) {
                                                updateSection({
                                                    ...section,
                                                    baseImageName: selectedImage.name,
                                                    baseImage: selectedImage.base64,
                                                    status: 'pending'  // 画像を変更したら状態をリセット
                                                });
                                                console.log(`🔄 "${section.h2Text}" のベース画像を "${selectedImage.name}" に変更しました`);
                                            }
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {availableImages.map(img => (
                                            <option key={img.name} value={img.name}>
                                                {img.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-gray-700">{section.baseImageName || 'N/A'}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">AI Background Suggestion:</p>
                                <div className="mt-1 p-2 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                                    {section.status === 'pending' && <span className="text-gray-400 italic">Will be generated automatically...</span>}
                                    {section.status === 'generating' && !section.backgroundInstruction && <span className="text-blue-600 animate-pulse">Thinking of a background...</span>}
                                    {section.backgroundInstruction && <span className="text-gray-800">{section.backgroundInstruction}</span>}
                                    {section.status === 'error' && !section.backgroundInstruction && <span className="text-red-500">Could not generate suggestion.</span>}
                                </div>
                            </div>
                             <div className="bg-gray-50 p-3 rounded-md">
                                <label htmlFor={`prompt-${section.id}`} className="font-semibold text-gray-600">Editable Prompt:</label>
                                <textarea
                                    id={`prompt-${section.id}`}
                                    value={editablePrompt}
                                    onChange={(e) => setEditablePrompt(e.target.value)}
                                    className="mt-1 block w-full h-48 p-2 text-xs font-mono text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    aria-label="Editable prompt"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {section.status === 'success' && section.generatedImage && (
                            <img src={section.generatedImage} alt="Generated" className="w-full h-full object-cover" />
                        )}
                        {section.status === 'generating' && (
                            <div className="text-center text-gray-500 p-4">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-2 font-semibold">Generating Image...</p>
                                {section.generationStep && <p className="mt-1 text-sm text-indigo-600">{section.generationStep}</p>}
                            </div>
                        )}
                        {section.status === 'error' && (
                            <div className="text-red-500 p-4">{section.errorMessage}</div>
                        )}
                        {section.status === 'pending' && section.baseImage && (
                           <img src={section.baseImage} alt="Base" className="w-full h-full object-cover opacity-50" />
                        )}
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={section.status === 'generating'}
                            className="mt-4 px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-md hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};