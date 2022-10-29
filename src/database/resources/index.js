const objetValidate = (args,msg) =>({
        args,
        msg
    })

const defaultValidations =(field) =>({
    notNull:objetValidate(true,'el campo title no puede ser nulo'),
    notEmpty:objetValidate(true, 'el titulo de la pelicula es requerido')
})

module.exports = {
    objetValidate,
    defaultValidations
}