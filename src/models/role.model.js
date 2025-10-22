export default (sequelize, DataTypes) => {
  const role = sequelize.define('role', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    keyWord: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    tableName: 'roles',
  });

  role.associate = (models) => {
    models.role.belongsToMany(models.user, {
      through: models.userRoleAssignment,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'users',
    });

    models.role.hasMany(models.userRoleAssignment, {
      foreignKey: 'roleId',
      as: 'userAssignments',
    });
  };

  return role;
};