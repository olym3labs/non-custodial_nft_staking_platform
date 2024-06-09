//Non-Custodial NFT Staking on EVM
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NonCustodialNFTStaking is ReentrancyGuard, Ownable {
    IERC721 public nft;
    IERC20 public rewardToken;

    struct Stake {
        address staker;
        uint256 startTime;
    }

    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256[]) public stakerToTokens;
    mapping(address => uint256) public stakerTokenCount;
    mapping(address => uint256) public stakerRewards;
    uint256 public totalStaked;

    event Staked(address indexed staker, uint256 indexed tokenId, uint256 timestamp);
    event Unstaked(address indexed staker, uint256 indexed tokenId, uint256 timestamp);
    //event RewardPaid(address indexed staker, uint256 reward);

    constructor(address _nftAddress, address _owner, address _rewardTokenAddress) Ownable(_owner) {
        require(_nftAddress != address(0), "Invalid NFT address");
        nft = IERC721(_nftAddress);
        rewardToken = IERC20(_rewardTokenAddress);
    }

    function stake(uint256 tokenId) public nonReentrant {
        require(nft.ownerOf(tokenId) == msg.sender, "You must own the token to stake it");
        require(stakes[tokenId].staker == address(0), "Token is already staked");

        stakes[tokenId] = Stake(msg.sender, block.timestamp);
        stakerToTokens[msg.sender].push(tokenId);
        stakerTokenCount[msg.sender] += 1;
        totalStaked += 1;

        emit Staked(msg.sender, tokenId, block.timestamp);
    }

    function unstake(uint256 tokenId) public nonReentrant {
        Stake memory stakeInfo = stakes[tokenId];
        require(stakeInfo.staker == msg.sender, "Caller is not the staker of this token");

        uint256 reward = calculateStakingRewards(tokenId);
        //rewardToken.transfer(msg.sender, reward);

        uint256 index = findTokenIndex(stakerToTokens[msg.sender], tokenId);
        removeTokenAtIndex(stakerToTokens[msg.sender], index);

        emit Unstaked(msg.sender, tokenId, block.timestamp);
        //emit RewardPaid(msg.sender, reward);
        stakerRewards [msg.sender] += reward;
        stakerTokenCount[msg.sender] -= 1;
        totalStaked -= 1;
        delete stakes[tokenId];
    }

    function calculateStakingRewards(uint256 tokenId) public view returns (uint256) {
        require(stakes[tokenId].staker != address(0), "Token is not staked");
        uint256 stakingDuration = block.timestamp - stakes[tokenId].startTime;
        return stakingDuration / 60 * 1 ether;  // Simplified reward calculation
    }

    function findTokenIndex(uint256[] storage tokens, uint256 tokenId) internal view returns (uint256) {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return i;
            }
        }
        revert("Token not found");
    }

    function getStakerTokenCount(address staker) public view returns (uint256) {
        return stakerTokenCount[staker];
    }

    function getStakerRewards(address staker) public view returns (uint256) {
        return stakerRewards[staker];
    }

    function zeroStakerRewards(address staker) public nonReentrant {
        stakerRewards [staker] = 0;
    }

    function getTotalStaked() public view returns (uint256) {
        return totalStaked;
    }

    function removeTokenAtIndex(uint256[] storage tokens, uint256 index) internal {
        tokens[index] = tokens[tokens.length - 1];
        tokens.pop();
    }
}
