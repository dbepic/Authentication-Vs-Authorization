import DataURIparser from 'datauri/parser.js';
import path from 'path';
import logger from '../Utils/logger.js';

const getdatauri = (file) => {
    if (!file || !file.originalname || !file.buffer) {
        logger.warn(`invalid in file`)
    }
    const parser = new DataURIparser();
    const ext = path.extname(file.originalname).toString();
    return parser.format(ext, file.buffer);
}

export default getdatauri;