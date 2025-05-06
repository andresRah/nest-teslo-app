export const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: Function
) => {
    if(!file) return callback(new Error('No file provided'), false);

    if (!file?.originalname?.match(/\.(csv)$/)) {
        return callback(new Error('Only csv files are allowed!'), false);
    }
    callback(null, true);
}