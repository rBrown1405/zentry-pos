const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    assignUserToBusiness
} = require('../controllers/user.controller');

// All user routes should be protected
router.use(protect);

// Routes that require super_admin or admin role
router.route('/')
    .get(authorize(['super_admin', 'admin']), getUsers)
    .post(authorize(['super_admin', 'admin']), createUser);

router.route('/:id')
    .get(authorize(['super_admin', 'admin']), getUser)
    .put(authorize(['super_admin', 'admin']), updateUser)
    .delete(authorize(['super_admin', 'admin']), deleteUser);

// Special routes
router.put('/:id/assign-business', authorize(['super_admin']), assignUserToBusiness);

module.exports = router;
