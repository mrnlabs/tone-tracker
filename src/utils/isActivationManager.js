const isActivationManager = (user) => {
    return user.role == 'TTG_ACTIVATION_MANAGER';
}

export default isActivationManager;