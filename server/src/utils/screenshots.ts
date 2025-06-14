import Screenshot from "../models/Screenshot";
import { cloudinary } from "./cloudinary";

export const deleteUserScreenshots = async (userId: string): Promise<boolean> => {
    try {
        const images = await Screenshot.find({ userId });
        if (images.length > 0) {
            console.log(`Deleting ${images.length} screenshots for user ${userId}`);
            await Promise.all(
                images.map(async (screenshot) => {
                    const publicId = screenshot.publicId ?? screenshot.url.split("/").pop()?.split(".")[0];
                    if (publicId) {
                        await cloudinary.uploader.destroy(`screenshots/${publicId}`, {
                            resource_type: "image",
                            invalidate: true,
                        });
                    }
                }
                ));
            console.log(`Successfully deleted screenshots for user ${userId}`);
        }
        await Screenshot.deleteMany({ userId });
        return true;
    } catch (error) {
        console.error(`Error deleting screenshots for user ${userId}:`, error);
        return false;
    }
}