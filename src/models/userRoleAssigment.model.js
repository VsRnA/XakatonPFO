export default (sequelize, DataTypes) => {
  const userRoleAssignment = sequelize.define('userRoleAssignment', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID пользователя, который назначил роль',
    },
  }, {
    timestamps: true,
    tableName: 'userRoleAssigment',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roleId'],
        name: 'unique_user_role',
      },
    ],
  });

  userRoleAssignment.associate = (models) => {
    models.userRoleAssignment.belongsTo(models.user, {
      foreignKey: 'userId',
      as: 'user',
    });


    models.userRoleAssignment.belongsTo(models.role, {
      foreignKey: 'roleId',
      as: 'role',
    });
  };

  return userRoleAssignment;
};