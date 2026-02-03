import DataURIparser from 'datauri/parser';
import path from 'path';

const getdatauri = (file) => {
    if (!file || !file.originalname || !file.buffer) {
        throw new Error(`file is not found`);
    }
    const parser = new DataURIparser();
    const ext = path.extname(file.originalname).toLowerCase();
    return parser.format(ext, file.buffer);
}

export default getdatauri;