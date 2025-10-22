export default (sequelize, DataTypes) => {
  const entropyAttachment = sequelize.define('entropyAttachment', {
    entropy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'userLotteryAssigned',
        key: 'entropy',
      },
    },
    attachmentKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'entropyAttachment',
  });

  entropyAttachment.associate = (models) => {
    models.entropyAttachment.belongsTo(models.userLotteryAssigned, {
      foreignKey: 'entropy',
      targetKey: 'entropy',
      as: 'userLotteryAssignment',
    });
  };

  return entropyAttachment;
};