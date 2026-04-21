const deployVotingDapp = async function (hre: any) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("VotingDapp", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

module.exports = deployVotingDapp;
module.exports.tags = ["VotingDapp"];
