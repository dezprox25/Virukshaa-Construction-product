const generateCustomId = async (Model, prefix) => {
  const count = await Model.countDocuments();
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
};

module.exports = generateCustomId;
