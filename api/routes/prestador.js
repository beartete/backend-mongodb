/* API Rest dos prestadores */
import express from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResult } from 'express-validator'
 
const router = express.Router();
const { db, ObjectId } = await connectToDatabase()
const nomeCollection = 'prestadores'
 
const validaPrestador = [
    check("cnpj")
    .not().isEmpty().trim().withMessage('é obirgatório informar o cnpj')
    .isNumeric().withMessage('O CNPJ só deve conter números')
    .isLength({min: 14, max:14}).withMessage('O CNPJ deve conter 14 nºs'),
    check('razao_social')
    .not().isEmpty().trim().withMessage('é obrigatório informar a razão')
    .isAlphanumeric('pt-BR', {ignore: '/.'})
    .withMessage('A razão social não deve ter caracteres especiais')
    .isLength({min: 5}).withMessage('A razão é muito curta. Mínimo 5')
    .isLength({max: 200}).withMessage('A razão é muito longa. Máximo 200'),
    check('cnae_fiscal')
    .isNumeric().withMessage('O código do CNAE deve ser um número'),
    check('nome_fantasia').optional({nullable: true})
]
/*
 * GET   /API/PRESTADORES
 * LISTA DE TODOS OS PRESTADORES
 */
router.get('/', async (req, res) => {
    try {
        db.collection(nomeCollection).find().sort({ razao_social: 1 })
            .toArray((err, docs) => {
                if (!err) {
                    res.status(200).json(docs)
                }
            })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: `Erro ao obter a listagem dos prestadores`,
                param: '/'
            }]
        })
    }
})
router.get('/id/:id', async(req, res ) =>{
 
    try{
 
        db.collection(nomeCollection).find({'_id' : {$eq: ObjectId(req.params.id)}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) //bad resquest
            }else{
                res.status(200).json(docs) //retorna documento
            }
     })
    }catch (err){
        res.status(500).json({"erro" : err.message})
    }
})
 
/**
 * DELETE /API/PRESTADORES/:ID
 * Apagar o prestador de serviço pelo id
 */
 
router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})
/**
 * POST /API/PRESTADORES/:ID
 * Insere um novo prestador de serviço
 */
router.post('/', validaPrestador, async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catche(err => res.status(400).json(err))
    }
})
/**
 * put /API/PRESTADORES/:ID
 * altera um prestador de serviço
 */
 
router.put('/', validaPrestador, async(req, res) =>{
    let idDocumento = req.body._id // armazena o id do documento
    delete req.body._id //iremos remover o id do body
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq : ObjectId(idDocumento)}},
                { $set: req.body})
        .then(result => res.status(200).send(result))
        .catche(err => res.status(400).json(err))
    }
})
 
// razão social
// listagem pela razao
 
 
router.get('/razao/:razao', async(req, res ) =>{
    try{
        db.collection(nomeCollection)
        .find({'razao_social' : {$regex:req.params.razao, $options : "i"}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) //bad resquest
            }else{
                res.status(200).json(docs) //retorna documento
            }
     })
    }catch (err){
        res.status(500).json({"erro" : err.message})
    }
})
 
export default router