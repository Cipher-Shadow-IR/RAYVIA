const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Crowdfunding Smart Contract Hardening & Security Audit Suite", function () {
  let crowdfundingContract;
  let owner, creator, contributor1, contributor2, nonContributor;

  const ONE_ETH = ethers.utils.parseEther("1.0");
  const TWO_ETH = ethers.utils.parseEther("2.0");
  const HALF_ETH = ethers.utils.parseEther("0.5");

  beforeEach(async function () {
    [owner, creator, contributor1, contributor2, nonContributor] = await ethers.getSigners();

    const CrowdfundingFactory = await ethers.getContractFactory("crowdfunding");
    crowdfundingContract = await CrowdfundingFactory.deploy();
    await crowdfundingContract.deployed();
  });

  describe("Project Creation & Input Validation", function () {
    it("Should create a valid project and emit ProjectCreated event", async function () {
      const tx = await crowdfundingContract.connect(creator).createNewProject(
        "Save The Bees",
        "Community effort to build bee sanctuaries",
        "Alice",
        "https://example.com",
        1, // 1 ETH goal
        10, // 10 minutes
        0, // Category: DESIGNANDTECH
        0, // RefundPolicy: REFUNDABLE
        "QmTestCid123"
      );

      await expect(tx)
        .to.emit(crowdfundingContract, "ProjectCreated")
        .withArgs(
          0,
          creator.address,
          "Save The Bees",
          ONE_ETH,
          10 * 60,
          0,
          0,
          "QmTestCid123"
        );

      const project = await crowdfundingContract.getProject(0);
      expect(project.projectName).to.equal("Save The Bees");
      expect(project.creatorAddress).to.equal(creator.address);
      expect(project.fundingGoal).to.equal(ONE_ETH);
      expect(project.cid).to.equal("QmTestCid123");
    });

    it("Should reject creation with empty project name", async function () {
      await expect(
        crowdfundingContract.connect(creator).createNewProject(
          "",
          "Desc",
          "Alice",
          "https://example.com",
          1,
          10,
          0,
          0,
          "QmTest"
        )
      ).to.be.revertedWith("Project name cannot be empty");
    });

    it("Should reject creation with empty description", async function () {
      await expect(
        crowdfundingContract.connect(creator).createNewProject(
          "Name",
          "",
          "Alice",
          "https://example.com",
          1,
          10,
          0,
          0,
          "QmTest"
        )
      ).to.be.revertedWith("Project description cannot be empty");
    });

    it("Should reject creation with empty CID", async function () {
      await expect(
        crowdfundingContract.connect(creator).createNewProject(
          "Name",
          "Desc",
          "Alice",
          "https://example.com",
          1,
          10,
          0,
          0,
          ""
        )
      ).to.be.revertedWith("CID cannot be empty");
    });

    it("Should reject zero funding goal or zero duration", async function () {
      await expect(
        crowdfundingContract.connect(creator).createNewProject(
          "Name",
          "Desc",
          "Alice",
          "https://example.com",
          0,
          10,
          0,
          0,
          "QmTest"
        )
      ).to.be.revertedWith("Funding goal must be greater than 0");

      await expect(
        crowdfundingContract.connect(creator).createNewProject(
          "Name",
          "Desc",
          "Alice",
          "https://example.com",
          1,
          0,
          0,
          0,
          "QmTest"
        )
      ).to.be.revertedWith("Duration must be greater than 0");
    });
  });

  describe("Contributions & Financial Accounting", function () {
    beforeEach(async function () {
      await crowdfundingContract.connect(creator).createNewProject(
        "Clean Oceans",
        "Plastic cleanup initiative",
        "Bob",
        "https://example.com",
        2, // 2 ETH goal
        10, // 10 minutes
        0, // REFUNDABLE
        0,
        "QmCleanOceans"
      );
    });

    it("Should record contribution and emit ContributionMade event", async function () {
      const tx = await crowdfundingContract.connect(contributor1).fundProject(0, { value: ONE_ETH });

      await expect(tx)
        .to.emit(crowdfundingContract, "ContributionMade")
        .withArgs(0, contributor1.address, ONE_ETH);

      const project = await crowdfundingContract.getProject(0);
      expect(project.amountRaised).to.equal(ONE_ETH);
      expect(project.contributors.length).to.equal(1);
      expect(project.contributors[0]).to.equal(contributor1.address);

      const userContrib = await crowdfundingContract.projectContributions(0, contributor1.address);
      expect(userContrib).to.equal(ONE_ETH);
    });

    it("Should reject creator funding their own project", async function () {
      await expect(
        crowdfundingContract.connect(creator).fundProject(0, { value: ONE_ETH })
      ).to.be.revertedWith("You are the project owner");
    });

    it("Should reject zero-value contribution", async function () {
      await expect(
        crowdfundingContract.connect(contributor1).fundProject(0, { value: 0 })
      ).to.be.revertedWith("Contribution must be greater than 0");
    });

    it("Should support multiple contributions from the same user", async function () {
      await crowdfundingContract.connect(contributor1).fundProject(0, { value: HALF_ETH });
      await crowdfundingContract.connect(contributor1).fundProject(0, { value: ONE_ETH });

      const project = await crowdfundingContract.getProject(0);
      expect(project.amountRaised).to.equal(HALF_ETH.add(ONE_ETH));
      expect(project.contributors.length).to.equal(1);
      expect(await crowdfundingContract.projectContributions(0, contributor1.address)).to.equal(HALF_ETH.add(ONE_ETH));
    });

    it("Should reject contribution after funding duration expires", async function () {
      await time.increase(11 * 60);

      await expect(
        crowdfundingContract.connect(contributor1).fundProject(0, { value: ONE_ETH })
      ).to.be.revertedWith("Project Funding Time Expired");
    });

    it("Should allow overfunding beyond goal", async function () {
      await crowdfundingContract.connect(contributor1).fundProject(0, { value: TWO_ETH });
      await crowdfundingContract.connect(contributor2).fundProject(0, { value: ONE_ETH });

      const project = await crowdfundingContract.getProject(0);
      expect(project.amountRaised).to.equal(ethers.utils.parseEther("3.0"));
    });
  });

  describe("Claiming Funds (Successful Projects)", function () {
    beforeEach(async function () {
      await crowdfundingContract.connect(creator).createNewProject(
        "Solar Bus",
        "Solar powered transportation",
        "Carol",
        "https://example.com",
        2, // 2 ETH goal
        10, // 10 minutes
        0,
        0, // REFUNDABLE
        "QmSolarBus"
      );

      await crowdfundingContract.connect(contributor1).fundProject(0, { value: TWO_ETH });
    });

    it("Should reject creator claiming funds before duration expires", async function () {
      await expect(
        crowdfundingContract.connect(creator).claimFund(0)
      ).to.be.revertedWith("Project Funding Time Not Expired");
    });

    it("Should reject non-creator claiming funds", async function () {
      await time.increase(11 * 60);
      await expect(
        crowdfundingContract.connect(contributor1).claimFund(0)
      ).to.be.revertedWith("You are not Project Owner");
    });

    it("Should allow creator to claim raised funds after deadline when goal is met", async function () {
      await time.increase(11 * 60);

      const initialCreatorBalance = await ethers.provider.getBalance(creator.address);

      const tx = await crowdfundingContract.connect(creator).claimFund(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalCreatorBalance = await ethers.provider.getBalance(creator.address);

      expect(finalCreatorBalance.add(gasUsed).sub(initialCreatorBalance)).to.equal(TWO_ETH);

      const project = await crowdfundingContract.getProject(0);
      expect(project.claimedAmount).to.be.true;

      await expect(tx)
        .to.emit(crowdfundingContract, "FundsClaimed")
        .withArgs(0, creator.address, TWO_ETH);
    });

    it("Should reject claiming raised funds twice", async function () {
      await time.increase(11 * 60);
      await crowdfundingContract.connect(creator).claimFund(0);

      await expect(
        crowdfundingContract.connect(creator).claimFund(0)
      ).to.be.revertedWith("Already claimed raised funds");
    });
  });

  describe("Refunds (Failed Projects)", function () {
    beforeEach(async function () {
      await crowdfundingContract.connect(creator).createNewProject(
        "Indie Film",
        "Low budget film project",
        "Dave",
        "https://example.com",
        5, // 5 ETH goal
        10, // 10 minutes
        1, // Category FILM
        0, // REFUNDABLE
        "QmIndieFilm"
      );

      await crowdfundingContract.connect(contributor1).fundProject(0, { value: ONE_ETH });
      await crowdfundingContract.connect(contributor2).fundProject(0, { value: HALF_ETH });
    });

    it("Should reject refund claim before project deadline", async function () {
      await expect(
        crowdfundingContract.connect(contributor1).claimRefund(0)
      ).to.be.revertedWith("Project Funding Time Not Expired");
    });

    it("Should allow contributor to claim refund after deadline if goal was not reached", async function () {
      await time.increase(11 * 60);

      const initialBalance = await ethers.provider.getBalance(contributor1.address);

      const tx = await crowdfundingContract.connect(contributor1).claimRefund(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await ethers.provider.getBalance(contributor1.address);
      expect(finalBalance.add(gasUsed).sub(initialBalance)).to.equal(ONE_ETH);

      expect(await crowdfundingContract.refundClaimedMap(0, contributor1.address)).to.be.true;

      await expect(tx)
        .to.emit(crowdfundingContract, "RefundClaimed")
        .withArgs(0, contributor1.address, ONE_ETH);
    });

    it("Should reject double refund claim", async function () {
      await time.increase(11 * 60);
      await crowdfundingContract.connect(contributor1).claimRefund(0);

      await expect(
        crowdfundingContract.connect(contributor1).claimRefund(0)
      ).to.be.revertedWith("Already claimed refund amount");
    });

    it("Should reject refund claim by non-contributor", async function () {
      await time.increase(11 * 60);

      await expect(
        crowdfundingContract.connect(nonContributor).claimRefund(0)
      ).to.be.revertedWith("You did not contribute to this project");
    });

    it("Should reject refund claim for Non-Refundable projects even if goal is missed", async function () {
      await crowdfundingContract.connect(creator).createNewProject(
        "NonRefundable Project",
        "Charity donation drive",
        "Eve",
        "https://example.com",
        10, // 10 ETH goal
        10, // 10 mins
        0,
        1, // NONREFUNDABLE
        "QmNonRefund"
      );

      await crowdfundingContract.connect(contributor1).fundProject(1, { value: ONE_ETH });
      await time.increase(11 * 60);

      await expect(
        crowdfundingContract.connect(contributor1).claimRefund(1)
      ).to.be.revertedWith("Funding goal reached or non-refundable");
    });
  });
});
