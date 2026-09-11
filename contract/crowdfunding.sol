// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract crowdfunding is ReentrancyGuard {
    enum Category {
        DESIGNANDTECH,
        FILM,
        ARTS,
        GAMES
    }

    enum RefundPolicy {
        REFUNDABLE,
        NONREFUNDABLE
    }

    struct Project {
        string projectName;
        string projectDescription;
        string creatorName;
        string projectLink;
        string cid;
        uint256 fundingGoal;
        uint256 duration;
        uint256 creationTime;
        uint256 amountRaised;
        address creatorAddress;
        Category category;
        RefundPolicy refundPolicy;
        address[] contributors;
        uint256[] amount;
        bool[] refundClaimed;
        bool claimedAmount;
    }

    struct ProjectMetadata {
        string projectName;
        string projectDescription;
        string creatorName;
        string cid;
        uint256 fundingGoal;
        uint256 amountRaised;
        uint256 totalContributors;
        uint256 creationTime;
        uint256 duration;
        Category category;
    }

    struct Funded {
        uint256 projectIndex;
        uint256 totalAmount;
    }

    Project[] private projects;

    mapping(address => uint256[]) private addressProjectsList;

    mapping(address => Funded[]) private addressFundingList;

    mapping(uint256 => mapping(address => uint256)) public projectContributions;

    mapping(uint256 => mapping(address => bool)) public refundClaimedMap;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string name,
        uint256 fundingGoal,
        uint256 duration,
        Category category,
        RefundPolicy refundPolicy,
        string cid
    );

    event ContributionMade(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );

    event FundsClaimed(
        uint256 indexed projectId,
        address indexed creator,
        uint256 amount
    );

    event RefundClaimed(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );

    modifier validIndex(uint256 _index) {
        require(_index < projects.length, "Invalid Project Id");
        _;
    }

    function createNewProject(
        string memory _name,
        string memory _desc,
        string memory _creatorName,
        string memory _projectLink,
        uint256 _fundingGoal,
        uint256 _duration,
        Category _category,
        RefundPolicy _refundPolicy,
        string memory _cid
    ) external {
        require(bytes(_name).length > 0, "Project name cannot be empty");
        require(bytes(_desc).length > 0, "Project description cannot be empty");
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(uint8(_category) <= uint8(Category.GAMES), "Invalid category");
        require(uint8(_refundPolicy) <= uint8(RefundPolicy.NONREFUNDABLE), "Invalid refund policy");

        uint256 projectId = projects.length;

        projects.push(
            Project({
                creatorAddress: msg.sender,
                projectName: _name,
                projectDescription: _desc,
                creatorName: _creatorName,
                projectLink: _projectLink,
                cid: _cid,
                fundingGoal: _fundingGoal * 10 ** 18,
                duration: _duration * (1 minutes),
                creationTime: block.timestamp,
                category: _category,
                refundPolicy: _refundPolicy,
                amountRaised: 0,
                contributors: new address[](0),
                amount: new uint256[](0),
                claimedAmount: false,
                refundClaimed: new bool[](0)
            })
        );

        addressProjectsList[msg.sender].push(projectId);

        emit ProjectCreated(
            projectId,
            msg.sender,
            _name,
            _fundingGoal * 10 ** 18,
            _duration * (1 minutes),
            _category,
            _refundPolicy,
            _cid
        );
    }

    function getProjectsCount() external view returns (uint256) {
        return projects.length;
    }

    function getAllProjectsDetail()
        external
        view
        returns (ProjectMetadata[] memory allProjects)
    {
        ProjectMetadata[] memory newList = new ProjectMetadata[](
            projects.length
        );
        for (uint256 i = 0; i < projects.length; i++) {
            newList[i] = ProjectMetadata(
                projects[i].projectName,
                projects[i].projectDescription,
                projects[i].creatorName,
                projects[i].cid,
                projects[i].fundingGoal,
                projects[i].amountRaised,
                projects[i].contributors.length,
                projects[i].creationTime,
                projects[i].duration,
                projects[i].category
            );
        }
        return newList;
    }

    function getProjectsDetail(
        uint256[] memory _indexList
    ) external view returns (ProjectMetadata[] memory projectsList) {
        ProjectMetadata[] memory newList = new ProjectMetadata[](
            _indexList.length
        );
        for (uint256 index = 0; index < _indexList.length; index++) {
            if (_indexList[index] < projects.length) {
                uint256 i = _indexList[index];
                newList[index] = ProjectMetadata(
                    projects[i].projectName,
                    projects[i].projectDescription,
                    projects[i].creatorName,
                    projects[i].cid,
                    projects[i].fundingGoal,
                    projects[i].amountRaised,
                    projects[i].contributors.length,
                    projects[i].creationTime,
                    projects[i].duration,
                    projects[i].category
                );
            } else {
                newList[index] = ProjectMetadata(
                    "Invalid Project",
                    "Invalid Project",
                    "Invalid Project",
                    "Invalid Project",
                    0,
                    0,
                    0,
                    0,
                    0,
                    Category.DESIGNANDTECH
                );
            }
        }
        return newList;
    }

    function getProject(
        uint256 _index
    ) external view validIndex(_index) returns (Project memory project) {
        Project memory p = projects[_index];
        uint256 len = p.contributors.length;
        p.amount = new uint256[](len);
        p.refundClaimed = new bool[](len);
        for (uint256 i = 0; i < len; i++) {
            address contributor = p.contributors[i];
            p.amount[i] = projectContributions[_index][contributor];
            p.refundClaimed[i] = refundClaimedMap[_index][contributor];
        }
        return p;
    }

    function getCreatorProjects(
        address creator
    ) external view returns (uint256[] memory createdProjects) {
        return addressProjectsList[creator];
    }

    function getUserFundings(
        address contributor
    ) external view returns (Funded[] memory fundedProjects) {
        return addressFundingList[contributor];
    }

    function fundProject(uint256 _index) external payable validIndex(_index) {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(
            projects[_index].creatorAddress != msg.sender,
            "You are the project owner"
        );
        require(
            block.timestamp <= projects[_index].creationTime + projects[_index].duration,
            "Project Funding Time Expired"
        );

        if (projectContributions[_index][msg.sender] == 0) {
            projects[_index].contributors.push(msg.sender);
        }
        projectContributions[_index][msg.sender] += msg.value;
        projects[_index].amountRaised += msg.value;

        _addToUserFundingList(_index, msg.value);

        emit ContributionMade(_index, msg.sender, msg.value);
    }

    function _addToUserFundingList(uint256 _index, uint256 _amount) internal {
        Funded[] storage userFundings = addressFundingList[msg.sender];
        for (uint256 i = 0; i < userFundings.length; i++) {
            if (userFundings[i].projectIndex == _index) {
                userFundings[i].totalAmount += _amount;
                return;
            }
        }
        userFundings.push(Funded(_index, _amount));
    }

    function claimFund(uint256 _index) external validIndex(_index) nonReentrant {
        require(
            projects[_index].creatorAddress == msg.sender,
            "You are not Project Owner"
        );
        require(
            block.timestamp > projects[_index].creationTime + projects[_index].duration,
            "Project Funding Time Not Expired"
        );
        require(
            projects[_index].refundPolicy == RefundPolicy.NONREFUNDABLE ||
                projects[_index].amountRaised >= projects[_index].fundingGoal,
            "Funding goal not reached"
        );
        require(
            !projects[_index].claimedAmount,
            "Already claimed raised funds"
        );

        uint256 amountToTransfer = projects[_index].amountRaised;
        projects[_index].claimedAmount = true;

        (bool success, ) = msg.sender.call{value: amountToTransfer}("");
        require(success, "Transfer failed");

        emit FundsClaimed(_index, msg.sender, amountToTransfer);
    }

    function claimRefund(uint256 _index) external validIndex(_index) nonReentrant {
        require(
            block.timestamp > projects[_index].creationTime + projects[_index].duration,
            "Project Funding Time Not Expired"
        );
        require(
            projects[_index].refundPolicy == RefundPolicy.REFUNDABLE &&
                projects[_index].amountRaised < projects[_index].fundingGoal,
            "Funding goal reached or non-refundable"
        );

        uint256 refundAmount = projectContributions[_index][msg.sender];
        require(refundAmount > 0, "You did not contribute to this project");
        require(
            !refundClaimedMap[_index][msg.sender],
            "Already claimed refund amount"
        );

        refundClaimedMap[_index][msg.sender] = true;

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Transfer failed");

        emit RefundClaimed(_index, msg.sender, refundAmount);
    }
}
