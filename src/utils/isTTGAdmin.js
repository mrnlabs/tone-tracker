const isTTGAdmin = (user) => {
    return (user.role == 'TTG_SUPER_ADMIN' || user.role == 'TTG_HEAD_ADMIN' || user.role == 'TTG_REGIONAL_MANAGER' || user.role == 'TTG_ACTIVATION_MANAGER');
}

export default isTTGAdmin