const objetcValidate = (args,msg) =>({
        args,
        msg
    })

const defaultValidations ={
    notNull:objetcValidate(true,'No puede ser nulo'),
    notEmpty:objetcValidate(true, 'El valor es requerido')
}

module.exports = {
    objetcValidate,
    defaultValidations
}