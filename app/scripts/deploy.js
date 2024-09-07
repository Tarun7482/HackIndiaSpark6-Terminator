const hre = require("hardhat");

async function main() {
    console.log("Displaying the smart contract..");
    const MedicalRecord = await hre.ethers.getContractFactory("MedicalRecord");
    const Medical = await MedicalRecord.deploy();
    
    console.log("Deploying contract...");
    await Medical.waitForDeployment();
    
    const address = await Medical.getAddress();
    console.log(`Medical contract deployed to address: ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });