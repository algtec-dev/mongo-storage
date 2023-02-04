const mongoose = require('mongoose');
const { createModel } = require("mongoose-gridfs");
const { Readable } = require('stream');

const init = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://zeluis:s0laris@localhost:27017/files?authSource=admin');
    return createModel();
}


const uploadFile = async(file) => {
    if (!file) {
        return null;
    }

    if (!file.originalname) {
        return null;
    }

    if (!file.buffer) {
        throw new Error(`no buffer from file ${file.originalname}`);
    }    

    const fileModel = await init();
    const stream = Readable.from(file.buffer);

    const writePromise = new Promise((resolve, reject) => {
        fileModel.write({
            filename: file.originalname,
            contentType: file.mimetype
        }, stream, function(err, file) {
            if (err) {
                return reject(err);
            }
            return resolve(file);
        });        
    });

    const mongoFile = await writePromise;

    return mongoFile;
}

const upload = async (req, res) => {
    if (!req) {
        throw new Error("no request data.");
    }

    if (!(req.files && req.files.length)) {
        throw new Error("no files provided.");
    }

    const responses = [];

    for (const file of req.files) {
        const uploadedFile = await uploadFile(file);
        if (!uploadFile) {
            continue;
        }
        responses.push(uploadedFile);
    }

    if (!responses.length) {
        throw new Error("Fail on upload this files.");
    }

    return responses;
}

const get = async (_id) => {
    const fileModel = await init();
    return await fileModel.findOne({
        _id
    });
}

const download = async (req, res) => {
    const fileModel = await init();

    const _id = req.params.id;
    if (!_id) {
        throw new Error("file not found.");
    }

    const fileObject = await get(_id);
    if (!fileObject) {
        throw new Error("file not found.");
    }

    const readStream = fileModel.read({
        _id: mongoose.Types.ObjectId(req.params.id)
    });

    res.setHeader('Content-disposition', 'attachment; filename=' + fileObject.filename);
    res.setHeader('Content-type', fileObject.contentType || (fileObject.metadata || {}).mime_type || 'application/x-binary');
  
    readStream.pipe(res);
}

module.exports = {
    upload,
    get,
    download
};
