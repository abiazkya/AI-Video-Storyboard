import React, { useState } from 'react';
import { generateStoryboard, generateImageFromPrompt } from '../services/geminiService';
import { Upload, Loader2, FileImage, Copy, Check, ImagePlus, Video } from 'lucide-react';
import Markdown from 'react-markdown';

const extractAllPrompts = (text: string) => {
  const prompts: { type: 'IMAGE' | 'VIDEO', title: string, content: string }[] = [];
  const regex = /(?:^|\n)\s*(?:\*\*)?(PROMPT (IMAGE|VIDEO).*?(?:\*\*|:)?)\s*\n([\s\S]*?)(?=(?:^|\n)\s*(?:\*\*)?PROMPT|$)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    prompts.push({
      type: match[2].toUpperCase() as 'IMAGE' | 'VIDEO',
      title: match[1].replace(/\*\*/g, '').trim(),
      content: match[3].trim()
    });
  }
  return prompts;
};

const PromptCard = ({ type, title, initialPrompt, defaultRefImage }: { type: 'IMAGE' | 'VIDEO', title: string, initialPrompt: string, defaultRefImage: File | null }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [refImage, setRefImage] = useState<File | null>(defaultRefImage);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRefImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let base64, mimeType;
      if (refImage) {
        const reader = new FileReader();
        const result = await new Promise<string>((resolve, reject) => {
          reader.readAsDataURL(refImage);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        base64 = result.split(',')[1];
        mimeType = refImage.type;
      }
      
      const imgUrl = await generateImageFromPrompt(prompt, base64, mimeType);
      setGeneratedImage(imgUrl);
      setIsImageLoading(true);
    } catch (error: any) {
      console.error(error);
      alert(`Gagal menghasilkan gambar: ${error.message || 'Error tidak diketahui'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800 flex items-center">
          {type === 'IMAGE' ? <ImagePlus className="w-4 h-4 mr-2 text-indigo-600" /> : <Video className="w-4 h-4 mr-2 text-indigo-600" />}
          {title}
        </h4>
        <button 
          onClick={handleCopy}
          className="flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 mr-1 text-green-600" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Tersalin!' : 'Copy'}
        </button>
      </div>
      <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full text-sm p-3 border border-gray-300 rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
        rows={4}
      />
      {type === 'IMAGE' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Upload Referensi Gambar (Opsional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {refImage && (
              <p className="text-xs text-gray-500 mt-2">
                * Menggunakan {refImage.name} sebagai referensi.
              </p>
            )}
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 self-end sm:self-auto"
          >
            {isGenerating ? 'Generating... (60 detik)' : 'Generate Image'}
          </button>
        </div>
      )}
      {type === 'IMAGE' && generatedImage && (
        <div className="mt-4 border-t border-gray-100 pt-4 relative">
          <p className="text-xs font-medium text-gray-500 mb-2">Hasil Gambar:</p>
          <div className="relative">
            {isImageLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg animate-pulse z-10">
                <Loader2 className="animate-spin h-6 w-6 text-indigo-600 mb-1" />
                <p className="text-[10px] text-gray-600 font-medium italic">Sabar ya...</p>
              </div>
            )}
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="max-w-xs w-full rounded-lg shadow-md" 
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function StoryboardCreator() {
  const [isAffiliate, setIsAffiliate] = useState(true);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productDesc, setProductDesc] = useState('');
  const [affiliateType, setAffiliateType] = useState('Soft Selling');
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [duration, setDuration] = useState('30');
  const [storyIdea, setStoryIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [allPrompts, setAllPrompts] = useState<{type: 'IMAGE' | 'VIDEO', title: string, content: string}[]>([]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterImage || (isAffiliate && !productImage)) return;

    setLoading(true);
    setResult(null);

    try {
      const charData = await fileToBase64(characterImage);
      let prodData;
      if (isAffiliate && productImage) {
        prodData = await fileToBase64(productImage);
      }

      const storyboardResult = await generateStoryboard(
        isAffiliate,
        prodData?.base64,
        prodData?.mimeType,
        productDesc,
        affiliateType,
        charData.base64,
        charData.mimeType,
        characterName,
        parseInt(duration, 10),
        storyIdea
      );

      setResult(storyboardResult);
      const extracted = extractAllPrompts(storyboardResult);
      setAllPrompts(extracted);
    } catch (error) {
      console.error('Error generating storyboard:', error);
      alert('Gagal membuat storyboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Story Board Generator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Affiliate Toggle */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Jenis Cerita:</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600 h-4 w-4"
                checked={isAffiliate}
                onChange={() => setIsAffiliate(true)}
              />
              <span className="ml-2 text-gray-700">Affiliate</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600 h-4 w-4"
                checked={!isAffiliate}
                onChange={() => setIsAffiliate(false)}
              />
              <span className="ml-2 text-gray-700">Non-Affiliate</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Karakter (Wajib)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                {characterImage ? (
                  <div className="text-sm text-gray-600">
                    <img src={URL.createObjectURL(characterImage)} alt="Character" className="mx-auto h-32 object-cover rounded-md mb-2" />
                    {characterImage.name}
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="char-image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload file</span>
                    <input id="char-image" name="char-image" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageChange(e, setCharacterImage)} required />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image (Conditional) */}
          {isAffiliate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Produk (Wajib)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors">
                <div className="space-y-1 text-center">
                  {productImage ? (
                    <div className="text-sm text-gray-600">
                      <img src={URL.createObjectURL(productImage)} alt="Product" className="mx-auto h-32 object-cover rounded-md mb-2" />
                      {productImage.name}
                    </div>
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="prod-image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload file</span>
                      <input id="prod-image" name="prod-image" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageChange(e, setProductImage)} required={isAffiliate} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Karakter</label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Contoh: Om Broto"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Video (Detik)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="15">15 Detik</option>
              <option value="30">30 Detik</option>
              <option value="60">60 Detik</option>
              <option value="90">90 Detik</option>
            </select>
          </div>
        </div>

        {isAffiliate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Konten Affiliate</label>
              <select
                value={affiliateType}
                onChange={(e) => setAffiliateType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
              >
                <option value="Soft Selling">Soft Selling</option>
                <option value="Hard Selling">Hard Selling</option>
                <option value="Story Telling">Story Telling</option>
                <option value="Review Produk">Review Produk</option>
                <option value="Problem Solusi">Problem Solusi</option>
                <option value="Promo Harga">Promo Harga</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Produk</label>
              <textarea
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Deskripsikan produk secara singkat..."
                required={isAffiliate}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ide Cerita (Opsional)</label>
          <textarea
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Masukkan ide cerita spesifik jika ada..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!characterImage || (isAffiliate && !productImage) || !characterName || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Membuat Storyboard...
              </>
            ) : (
              'Generate Storyboard'
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileImage className="mr-2 h-5 w-5 text-indigo-600" />
                Hasil Storyboard:
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Tersalin!' : 'Copy Storyboard'}
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 overflow-auto max-h-[800px] border border-gray-200 prose prose-indigo max-w-none">
              <Markdown>{result}</Markdown>
            </div>
          </div>

          {allPrompts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <ImagePlus className="mr-2 h-5 w-5 text-indigo-600" />
                Daftar Prompt
              </h3>
              <div className="space-y-4">
                {allPrompts.map((prompt, index) => (
                  <PromptCard key={index} type={prompt.type} title={prompt.title} initialPrompt={prompt.content} defaultRefImage={characterImage} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
