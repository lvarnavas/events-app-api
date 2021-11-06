const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');

const router = express.Router();

// ΕΠΙΣΤΡΕΦΕΙ ΣΥΓΚΕΚΡΙΜΕΝΟ USER
router.get('/:uid', usersControllers.getUsersById);

// ΔΗΜΙΟΥΡΓΕΙ ΕΝΑΝ USER
router.post(
    '/signup',
    [
        check('name').not().isEmpty(),
        check('email')
            .normalizeEmail()  //  Test@test.com => test@test.com
            .isEmail(),
        check('password').isLength({min: 6})
    ], 
    usersControllers.signup);

// ΚΑΝΕΙ ΤΗΝ ΕΙΣΟΔΟ ΕΝΟΣ USER
router.post('/login', usersControllers.login);
router.patch('/imgprofile', usersControllers.imgProfile);
// ΑΛΛΑΖΕΙ ΤΟ PASSWORD ΤΟΥ USER
router.patch('/:uid',
    [
        check('password').isLength({min: 6})
    ],
    usersControllers.updatePassword);


// PASSWORD RESET
router.post('/reset', usersControllers.postReset);
router.get('/reset/:token', usersControllers.getNewPassword);
router.post('/newpassword', usersControllers.postNewPassword);


module.exports = router;