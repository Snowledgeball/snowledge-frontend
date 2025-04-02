import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

export default function ImageUploader({
  onImagesChange,
  maxImages = 3,
  maxSizeInMB = 5,
}: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filtrer les fichiers trop volumineux
      const validFiles = acceptedFiles.filter(
        (file) => file.size <= maxSizeInBytes
      );

      // Limiter le nombre d'images
      const newImages = [...images, ...validFiles].slice(0, maxImages);
      setImages(newImages);
      onImagesChange(newImages);

      // Créer des URLs pour les previews
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));

      // Révoquer les anciens URLs pour éviter les fuites de mémoire
      previews.forEach((url) => URL.revokeObjectURL(url));

      setPreviews(newPreviews);
    },
    [images, maxImages, maxSizeInBytes, onImagesChange, previews]
  );

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesChange(newImages);

    // Révoquer l'URL de l'image supprimée
    URL.revokeObjectURL(previews[index]);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: maxSizeInBytes,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          "flex flex-col items-center justify-center text-center",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} disabled={images.length >= maxImages} />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-primary/10">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive
                ? "Déposez les images ici"
                : "Glissez-déposez vos images, ou cliquez pour en sélectionner"}
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG ou GIF (max. {maxSizeInMB} Mo par image, {maxImages}{" "}
              images max)
            </p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Aperçu ${index + 1}`}
                className="h-24 w-full object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
