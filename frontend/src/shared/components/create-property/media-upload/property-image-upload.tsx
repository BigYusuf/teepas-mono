import React, { useEffect } from "react";
import ImagePlaceHolder from "../../image-placeholder";

const PropertyImagesUpload = ({ setValue, images, setImages, draftMeta }: any) => {
  // Always ensure cover image is displayed first
  const sortedImages = React.useMemo(() => {
    if (!images) return [];
    return [...images].sort((a, b) => {
      if (a?.isCover) return -1;
      if (b?.isCover) return 1;
      return 0;
    });
  }, [images]);

  useEffect(() => {
    if (sortedImages && sortedImages.length >= 0) {
      setValue("images", sortedImages, { shouldValidate: true });
    }
  }, [sortedImages, setValue]);

  return (
    <div className="flex gap-6">
      <div className="md:w-[85%]">
        {sortedImages?.length > 0 && (
          <ImagePlaceHolder
            size="765 x 850"
            small={false}
            images={sortedImages}
            setImages={setImages}
            setValue={setValue}
            index={0}
            selectedItemId={draftMeta?.id}
            defaultImage={
              sortedImages[0]?.base64 ||
              sortedImages[0]?.url ||
              (typeof sortedImages[0] === "string" ? sortedImages[0] : null)
            }
          />
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          {sortedImages.slice(1).map((img, index) => (
            <ImagePlaceHolder
              key={img?.fileId || img?.url || index}
              size="765 x 850"
              images={sortedImages}
              setImages={setImages}
              small
              setValue={setValue}
              selectedItemId={draftMeta?.id}
              index={index + 1}
              defaultImage={
                img?.base64 ||
                img?.url ||
                (typeof img === "string" ? img : null)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};


export default PropertyImagesUpload;
