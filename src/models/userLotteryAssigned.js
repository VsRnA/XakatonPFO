export default (sequelize, DataTypes) => {
  const userLotteryAssigned = sequelize.define('userLotteryAssigned', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    lotteryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lottery',
        key: 'id',
      },
    },
    entropy: {
      type: DataTypes.STRING(225),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('inProgress', 'won', 'lost'),
      allowNull: false,
      defaultValue: 'inProgress',
    },
    placement: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: 'userLotteryAssigned',
  });

  userLotteryAssigned.associate = (models) => {
    models.userLotteryAssigned.belongsTo(models.user, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user',
    });

    models.userLotteryAssigned.belongsTo(models.lottery, {
      foreignKey: 'lotteryId',
      as: 'lottery',
    });

    models.userLotteryAssigned.hasMany(models.entropyAttachment, {
      foreignKey: 'entropy',
      sourceKey: 'entropy',
      as: 'attachments',
    });
  };

  return userLotteryAssigned;
};