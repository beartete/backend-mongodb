/* API REST dos prestadores */
import  express, { Router } from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResUlt } from 'express-validator' 

const router = express.Router();
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'prestadores'

const validaPrestador = [
    check('cnpj')
    .not().isEmpty().trim().withMessage('É obrigatório informar o CNPJ')
    .isNumeric().withMessage('O CNPJ só deve conter números')
    .isLeght({min: 14, max:14}).withMessage('O CNPJ deve conter 14 n°s'),
    check('razao_social')
    .not().isEmpty().trim().withMessage('É obrigatório informar a razão')
    .isAlphanumeric('pt-BR', {ignore:'/. '})
    .isLenght({min: 5}).withMessage('A razão é muito curta. Mínimo 5')
    .isLenght({max: 200}).withMessage('A razão é muito longa. Mínimo 200'),
    check('cnae_fiscal')
    .isNumeric().withMessage('O código do CNAE deve ser um número'),
    check('nome_fantasia').optional({nullable: true})
]

/*
 * GET   /API/PRESTADORES
 * LISTA DE TODOS OS PRESTADORES
 */
router.get('/',async(req,res) => {
    try{
        db.collection(nomeCollection).find().sort({razao_social: 1})
        .toArray((err,docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg:`Erro ao obter a listagem dos prestadores`,
                param: '/'
            }]
        })
    }
})

router.get('/id/:id', async(req, res)=> {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: Object(req.params.id)}})
        .toArray((err, docs)=> {
            if(err){
                res.status(400).json(err) //bad request
            } else{
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"erro": err.message})
    }
})

/*
 * GET   /API/PRESTADORES/RAZAO/
 * LISTA OS PRESTADORES DE SERVIÇO PELA RAZÃO SOCIAL
 */
router.get('/',async(req,res) => {
    try{
        db.collection(nomeCollection).find().sort({razao_social: 1})
        .toArray((err,docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err){
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg:`Erro ao obter a listagem dos prestadores`,
                param: '/'
            }]
        })
    }
})

router.get('/razao/:razao', async(req, res)=> {
    try{
         db.collection(nomeCollection)
        .find({'razao_social': {$regex: req.params.razao, $options: "i"}})
        .toArray((err, docs)=> {
            if(err){
                res.status(400).json(err) //bad request
            } else{
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"erro": err.message})
    }
})

/**
 * DELETE /api/prestadores/:id
 * Apagar o prestador de serviço pelo id
 */

router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})

/**
 *  POST /api/prestadores
 *  Insere um novo prestador
 */
router.post('/', validaPrestador, async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.colletion(nomeCollection)
        .inserOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.stauts(400).json(err))
    }
})


/**
 *  PUT /api/prestadores
 *  Insere um novo prestador
 */
router.put('/', validaPrestador, async(req, res) => {
    let idDocumento =req.body._id //armazenando o id do documento
    delete req.body._id //iremos remover o id do body

    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.colletion(nomeCollection)
        .updateOne({'_id': {$eq : ObjectId(idDocumento)}},
                          {$set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.stauts(400).json(err))
    }
})
export default router


