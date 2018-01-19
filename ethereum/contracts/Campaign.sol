pragma solidity ^0.4.17;

contract Campaign {
    struct SpendingReq {
        string description;
        uint val;
        address receiver;
        bool complete;
        mapping(address => bool) approvals;
        uint approvalCount;
    }

    address public manager;
    mapping (address => bool) public contributors;
    uint contributorCount;
    SpendingReq[] public requests;
    uint minContribAmt;


    modifier minVal() {
        require(msg.value > minContribAmt);
        _;
    }

    modifier adminRestricted() {
        require(msg.sender == manager);
        _;
    }

    modifier approverRestricted() {
        require(contributors[msg.sender]);
        _;
    }

    function Campaign(uint minAmt, address creator) public {
        manager = creator;
        minContribAmt = minAmt;
        contributorCount = 0;
    }

    function contribute() public payable minVal {
        if (!contributors[msg.sender]) {
            contributors[msg.sender] = true;
            contributorCount = contributorCount + 1;
        }
    }

    function approveReq(uint index) public approverRestricted {
        SpendingReq storage req = requests[index];
        require(!req.approvals[msg.sender]);
        req.approvals[msg.sender] = true;
        req.approvalCount = req.approvalCount + 1;

    }

    function makeReq(string description, uint val, address receiver)
    public payable adminRestricted {
        SpendingReq memory newReq = SpendingReq({
            description: description,
            val: val,
            receiver: receiver,
            complete: false,
            approvalCount: 0
            });

        requests.push(newReq);
    }

    function finalizeReq(uint index) public adminRestricted {
        SpendingReq storage req = requests[index];
        require(!req.complete && contributorCount > req.approvalCount / 2);
        req.receiver.transfer(req.val);
        req.complete = true;
    }

}