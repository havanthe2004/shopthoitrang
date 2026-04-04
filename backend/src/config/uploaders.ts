import { createUploader } from "./multer";

export const uploadUserAvatar = createUploader("avatars/user");
export const uploadAdminAvatar = createUploader("avatars/admin");
export const uploadProductImage = createUploader("products");
