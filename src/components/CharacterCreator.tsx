import React, { useState } from 'react';
import { generateCharacterJSON, generateImageFromPrompt } from '../services/geminiService';
import { Upload, Loader2, Copy, Check, ImagePlus } from 'lucide-react';

export default function CharacterCreator() {
  const [refImage, setRefImage] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [gender, setGender] = useState('Laki-laki');
  const [nationality, setNationality] = useState('Indonesia');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [imagePrompt, setImagePrompt] = useState('');
  const [genRefImage, setGenRefImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    if (!refImage) return;

    setLoading(true);
    setResult(null);

    try {
      const refData = await fileToBase64(refImage);
      let faceData;
      if (faceImage) {
        faceData = await fileToBase64(faceImage);
      }

      const jsonResult = await generateCharacterJSON(
        refData.base64,
        refData.mimeType,
        faceData?.base64,
        faceData?.mimeType,
        gender,
        nationality
      );

      setResult(jsonResult);
      
      try {
        const jsonMatch = jsonResult.match(/```(?:json)?\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : jsonResult;
        const parsed = JSON.parse(jsonString);
        
        let extractedPrompt = jsonString;
        if (parsed.generation_parameters && parsed.generation_parameters.prompts && parsed.generation_parameters.prompts.length > 0) {
          extractedPrompt = parsed.generation_parameters.prompts[0];
        } else if (parsed.prompt) {
          extractedPrompt = parsed.prompt;
        }
        
        setImagePrompt(extractedPrompt);
      } catch (e) {
        setImagePrompt(jsonResult);
      }
      setGenRefImage(faceImage || refImage);
    } catch (error) {
      console.error('Error generating character JSON:', error);
      alert('Gagal membuat karakter. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      let base64, mimeType;
      if (genRefImage) {
        const refData = await fileToBase64(genRefImage);
        base64 = refData.base64;
        mimeType = refData.mimeType;
      }
      
      const imgUrl = await generateImageFromPrompt(imagePrompt, base64, mimeType);
      setGeneratedImage(imgUrl);
    } catch (error: any) {
      console.error(error);
      alert(`Gagal menghasilkan gambar karakter: ${error.message || 'Error tidak diketahui'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bikin Karakter Pakai JSON Prompt</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Referensi (Wajib)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                {refImage ? (
                  <div className="text-sm text-gray-600">
                    <img src={URL.createObjectURL(refImage)} alt="Reference" className="mx-auto h-32 object-cover rounded-md mb-2" />
                    {refImage.name}
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="ref-image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload file</span>
                    <input id="ref-image" name="ref-image" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageChange(e, setRefImage)} required />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Face Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Wajah (Opsional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors">
              <div className="space-y-1 text-center">
                {faceImage ? (
                  <div className="text-sm text-gray-600">
                    <img src={URL.createObjectURL(faceImage)} alt="Face" className="mx-auto h-32 object-cover rounded-md mb-2" />
                    {faceImage.name}
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="face-image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload file</span>
                    <input id="face-image" name="face-image" type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageChange(e, setFaceImage)} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kebangsaan</label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="Indonesia">Indonesia</option>
              <option value="Amerika Serikat">Amerika Serikat</option>
              <option value="Jepang">Jepang</option>
              <option value="Korea Selatan">Korea Selatan</option>
              <option value="Inggris">Inggris</option>
              <option value="Eropa">Eropa</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!refImage || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Menganalisis Gambar...
              </>
            ) : (
              'Buat JSON Prompt'
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Hasil JSON Prompt:</h3>
              <button
                onClick={handleCopy}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Tersalin!' : 'Copy JSON'}
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-[600px] border border-gray-200">
              <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
              <ImagePlus className="mr-2 h-5 w-5 text-indigo-600" />
              Generate Gambar Karakter
            </h3>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full text-sm p-3 border border-gray-300 rounded-md mb-4 focus:ring-indigo-500 focus:border-indigo-500"
              rows={6}
            />
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Upload Referensi Wajah (Opsional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setGenRefImage)} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {genRefImage && (
                  <p className="text-xs text-gray-500 mt-2">
                    * Menggunakan {genRefImage.name} sebagai referensi wajah.
                  </p>
                )}
              </div>
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 self-end sm:self-auto"
              >
                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
            {generatedImage && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Hasil Gambar:</p>
                <img src={generatedImage} alt="Generated Character" className="max-w-md w-full rounded-lg shadow-md" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
