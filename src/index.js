const express = require('express');
const mongoService = require('./services/mongo-services');
const uuid = require('uuid');
const multer = require('multer');
const upload = multer();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit : '50mb'  }));

app.get('/:id', async (req, res) => {
    try {
        const jsonResponse = await mongoService.get(req.params.id);
        res.status(200).send(jsonResponse);
    } catch (err) {
        return res.status(400).json({ status: 'error', message: err.message });
    }
});

app.get('/download/:id', async (req, res) => {
    try {
        await mongoService.download(req, res);
        // res.status(200).send(jsonResponse);
    } catch (err) {
        return res.status(400).json({ status: 'error', message: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Envie o documento via POST.');
});

app.post('/', upload.any(), async (req, res) => {
    try {
        const jsonResponse = await mongoService.upload(req, res);
        res.status(200).send(jsonResponse);
    } catch (err) {
        return res.status(400).json({ status: 'error', message: err.message });
    }
});


app.listen(process.env.PORT || '5000');

