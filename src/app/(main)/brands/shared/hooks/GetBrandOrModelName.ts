import { Brand } from "@/src/utils/types/brand";
import { useBrandAndModelApi } from "./useBrandAndModelApi"
import { Model } from "@/src/utils/types/model";

const {getBrandById, getModelById} = useBrandAndModelApi();

export const getBrandNameById = async (brandId : string) : Promise<string> => {
    try{
        const brand : Brand = await getBrandById(brandId);
        return brand.name;
    }catch{
        return ".."
    }
}

export const getModelNameById = async (modelId : string):Promise<string> => {
    try{
        const model : Model = await getModelById(modelId);
        return model.name;
    }catch{
        return ".."
    }
}
