export default (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: true,
    tableName: 'users',
  });

  user.associate = (models) => {
    models.user.belongsToMany(models.role, {
      through: models.userRoleAssignment,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles',
    });

    models.user.hasMany(models.userRoleAssignment, {
      foreignKey: 'userId',
      as: 'roleAssignments',
    });

    models.user.hasMany(models.userLotteryAssigned, {
      foreignKey: 'userId',
      as: 'lotteryAssignments',
    });

    models.user.hasMany(models.lottery, {
      foreignKey: 'organizatorId',
      as: 'createdLotteries',
    });
  };

  return user;
};