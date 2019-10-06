const ProjectModel = require("../model/project");

const list = async ctx => {
  const { isActive = null } = ctx.query;
  const query = {};
  if (isActive !== null) {
    query.isActive = isActive === "true";
  }
  const response = await ProjectModel.list(query);
  ctx.body = response;
};

const save = async ctx => {
  const { name, isActive = false } = ctx.request.body;
  const result = await ProjectModel.create({ name, isActive });
  ctx.body = result;
};

const update = async ctx => {
  const { id } = ctx.params;
  const { name } = ctx.request.body;

  const data = {
    $set: {
      name
    }
  };

  const result = await ProjectModel.updateById(id, data);
  ctx.body = result;
};

const switchProject = async ctx => {
  const { switchAppId, activeProjId } = ctx.request.body;

  const inAcitveProject = await ProjectModel.updateById(activeProjId, {
    $set: { isActive: false }
  });

  const activeProject = await ProjectModel.updateById(switchAppId, {
    $set: { isActive: true }
  });

  ctx.body = { inAcitveProject, activeProject };
};

module.exports = {
  list,
  save,
  update,
  switchProject
};
