const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredChainCreditScore", function () {
  let credChainCreditScore;
  let owner;
  let calculator;
  let oracle;
  let user;

  beforeEach(async function () {
    [owner, calculator, oracle, user] = await ethers.getSigners();
    
    const CredChainCreditScore = await ethers.getContractFactory("CredChainCreditScore");
    credChainCreditScore = await CredChainCreditScore.deploy();
    await credChainCreditScore.waitForDeployment();

    // Autorizar calculador e oráculo
    await credChainCreditScore.authorizeCalculator(calculator.address);
    await credChainCreditScore.authorizeOracle(oracle.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await credChainCreditScore.owner()).to.equal(owner.address);
    });

    it("Should set the initial version to 1", async function () {
      expect(await credChainCreditScore.currentVersion()).to.equal(1);
    });
  });

  describe("Credit Score Management", function () {
    it("Should allow authorized calculator to update credit score", async function () {
      const score = 750;
      const metadata = '{"factors": ["payment_history", "credit_utilization"]}';
      
      const tx = await credChainCreditScore.connect(calculator).updateCreditScore(
        user.address,
        score,
        metadata
      );
      
      await expect(tx).to.emit(credChainCreditScore, "ScoreUpdated")
        .withArgs(user.address, score, await getCurrentTimestamp(), 1);

      const scoreInfo = await credChainCreditScore.getCreditScoreInfo(user.address);
      expect(scoreInfo.score).to.equal(score);
      expect(scoreInfo.isValid).to.be.true;
    });

    it("Should not allow unauthorized address to update credit score", async function () {
      await expect(
        credChainCreditScore.connect(user).updateCreditScore(
          user.address,
          750,
          "{}"
        )
      ).to.be.revertedWith("CredChain: Only authorized calculators can call this function");
    });

    it("Should reject invalid scores", async function () {
      await expect(
        credChainCreditScore.connect(calculator).updateCreditScore(
          user.address,
          1500, // Score inválido (> 1000)
          "{}"
        )
      ).to.be.revertedWith("CredChain: Score must be between 0 and 1000");
    });

    it("Should reject zero address", async function () {
      await expect(
        credChainCreditScore.connect(calculator).updateCreditScore(
          ethers.ZeroAddress,
          750,
          "{}"
        )
      ).to.be.revertedWith("CredChain: Invalid user address");
    });
  });

  describe("Score Factors", function () {
    it("Should allow oracle to add score factors", async function () {
      const factorName = "payment_history";
      const weight = 30;
      const value = 85;

      await expect(credChainCreditScore.connect(oracle).addScoreFactor(
        user.address,
        factorName,
        weight,
        value
      )).to.emit(credChainCreditScore, "ScoreFactorAdded")
        .withArgs(user.address, factorName, weight, value);

      const factors = await credChainCreditScore.getUserScoreFactors(user.address);
      expect(factors.length).to.equal(1);
      expect(factors[0].name).to.equal(factorName);
      expect(factors[0].weight).to.equal(weight);
      expect(factors[0].value).to.equal(value);
    });

    it("Should not allow unauthorized address to add score factors", async function () {
      await expect(
        credChainCreditScore.connect(user).addScoreFactor(
          user.address,
          "payment_history",
          30,
          85
        )
      ).to.be.revertedWith("CredChain: Only authorized oracles can call this function");
    });

    it("Should reject invalid weight", async function () {
      await expect(
        credChainCreditScore.connect(oracle).addScoreFactor(
          user.address,
          "payment_history",
          150, // Weight inválido (> 100)
          85
        )
      ).to.be.revertedWith("CredChain: Weight must be <= 100");
    });
  });

  describe("Score Calculation", function () {
    it("Should calculate score based on factors", async function () {
      // Adicionar fatores
      await credChainCreditScore.connect(oracle).addScoreFactor(
        user.address,
        "payment_history",
        40,
        90
      );
      
      await credChainCreditScore.connect(oracle).addScoreFactor(
        user.address,
        "credit_utilization",
        30,
        80
      );

      const calculatedScore = await credChainCreditScore.calculateScore(user.address);
      expect(calculatedScore).to.be.greaterThan(0);
    });

    it("Should return neutral score when no factors", async function () {
      const calculatedScore = await credChainCreditScore.calculateScore(user.address);
      expect(calculatedScore).to.equal(500); // Score neutro
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize calculator", async function () {
      await expect(credChainCreditScore.authorizeCalculator(user.address))
        .to.not.be.reverted;
    });

    it("Should allow owner to revoke calculator", async function () {
      await credChainCreditScore.authorizeCalculator(user.address);
      await expect(credChainCreditScore.revokeCalculator(user.address))
        .to.not.be.reverted;
    });

    it("Should not allow non-owner to authorize calculator", async function () {
      await expect(
        credChainCreditScore.connect(user).authorizeCalculator(user.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Score Validation", function () {
    it("Should check if user has valid score", async function () {
      // Inicialmente não tem score válido
      expect(await credChainCreditScore.hasValidScore(user.address)).to.be.false;

      // Adicionar score
      await credChainCreditScore.connect(calculator).updateCreditScore(
        user.address,
        750,
        "{}"
      );

      // Agora tem score válido
      expect(await credChainCreditScore.hasValidScore(user.address)).to.be.true;
    });

    it("Should allow owner to invalidate score", async function () {
      // Adicionar score
      await credChainCreditScore.connect(calculator).updateCreditScore(
        user.address,
        750,
        "{}"
      );

      // Invalidar score
      await credChainCreditScore.invalidateScore(user.address);
      expect(await credChainCreditScore.hasValidScore(user.address)).to.be.false;
    });
  });

  describe("Version Management", function () {
    it("Should allow owner to update version", async function () {
      await credChainCreditScore.updateVersion(2);
      expect(await credChainCreditScore.currentVersion()).to.equal(2);
    });

    it("Should not allow version downgrade", async function () {
      await expect(
        credChainCreditScore.updateVersion(0)
      ).to.be.revertedWith("CredChain: Version must be greater than current");
    });
  });

  describe("Contract Info", function () {
    it("Should return contract information", async function () {
      const info = await credChainCreditScore.getContractInfo();
      expect(info.version).to.equal(1);
      expect(info.maxScore).to.equal(1000);
      expect(info.minScore).to.equal(0);
    });
  });
});

// Helper function para obter timestamp atual
async function getCurrentTimestamp() {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
}
