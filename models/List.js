module.exports = (sequelize, DataTypes) => {
  const List = sequelize.define(
    'List',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      imageUrl: DataTypes.STRING
    },
    {
      underscored: true
    }
  );

  List.associate = models => {
    List.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    });
  };

  return List;
};
