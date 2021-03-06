const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina : 'Crear cuenta en Uptask'
    })
}

exports.formIniciarSesion = (req, res) => {
    const {error} = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina : 'Iniciar sesión en Uptask',
        error
    })
}

exports.crearCuenta = async (req, res) => {
    // leer los datos
    const { email, password } = req.body;

    try{
            // crear el usuario
        await Usuarios.create({
            email, 
            password
        });

        // crear URL de confirmación
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        // crear el objeto de usuario
        const usuario = {
            email
        }
        // Enviar el correo 
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta UpTask',
            confirmarUrl,
            archivo: 'confirmar-cuenta'
        });

        // redirigir al usuario
        req.flash('correcto', 'Te enviamos un correo. Confirma tu cuenta.');
        res.redirect('/iniciar-sesion')
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina : 'Crear cuenta en Uptask',
            email,
            password
        })
    }
}

exports.formRestablecerPassword = (req, res) => {
    res.render('restablecer', {
        nombrePagina: 'Restablecer tu contraseña'
    })
}

// Cambia el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    // Si no existe el usuario,..
    if(!usuario){
        req.flash('error', 'No existe ese usuario');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente!');
    res.redirect('/iniciar-sesion');
}