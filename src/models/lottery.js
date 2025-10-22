export default (sequelize, DataTypes) => {
  const lottery = sequelize.define('lottery', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attachmentKey: {
      type: DataTypes.STRING,
      allowNull: true,     
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'inProgress', 'finished'),
      allowNull: false,
      defaultValue: 'draft',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'lottery',
  });

  lottery.associate = (models) => {
    models.lottery.hasMany(models.userLotteryAssigned, {
      foreignKey: 'lotteryId',
      as: 'assignedUsers',
    });

    models.lottery.belongsTo(models.user, {
      foreignKey: 'organizatorId',
      as: 'organizator',
    });
  };

  return lottery;
};