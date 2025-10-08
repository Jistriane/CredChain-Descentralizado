// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CredChainCreditScore
 * @dev Smart contract para gerenciamento de scores de crédito no CredChain
 * @author CredChain Team
 * @notice Este contrato implementa o sistema de credit scoring descentralizado
 */
contract CredChainCreditScore is ReentrancyGuard, Ownable, Pausable {
    // Estruturas de dados
    struct CreditScore {
        uint256 score;           // Score de 0 a 1000
        uint256 timestamp;       // Timestamp da última atualização
        uint256 version;         // Versão do algoritmo de cálculo
        bool isValid;           // Se o score está válido
        string metadata;        // Metadados adicionais (JSON)
    }

    struct ScoreFactor {
        string name;            // Nome do fator
        uint256 weight;         // Peso do fator (0-100)
        uint256 value;          // Valor do fator
        bool isActive;          // Se o fator está ativo
    }

    // Eventos
    event ScoreUpdated(
        address indexed user,
        uint256 indexed score,
        uint256 timestamp,
        uint256 version
    );
    
    event ScoreFactorAdded(
        address indexed user,
        string indexed factorName,
        uint256 weight,
        uint256 value
    );
    
    event ScoreCalculated(
        address indexed user,
        uint256 finalScore,
        uint256 timestamp
    );
    // Eventos de auditoria e segurança
    event SecurityEvent(
        string indexed eventType,
        address indexed user,
        uint256 timestamp,
        string details
    );
    
    event AccessGranted(
        address indexed user,
        string indexed role,
        uint256 timestamp
    );
    
    event AccessRevoked(
        address indexed user,
        string indexed role,
        uint256 timestamp
    );
    
    event ContractPaused(
        address indexed admin,
        uint256 timestamp,
        string reason
    );
    
    event ContractUnpaused(
        address indexed admin,
        uint256 timestamp
    );

    // Mapeamentos
    mapping(address => CreditScore) public creditScores;
    mapping(address => ScoreFactor[]) public userScoreFactors;
    mapping(address => bool) public authorizedCalculators;
    mapping(address => bool) public authorizedOracles;
    
    // Variáveis de estado
        uint256 public currentVersion;
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant MIN_SCORE = 0;
    
    // Modificadores
        modifier onlyAuthorizedCalculator() {
        require(
            authorizedCalculators[msg.sender] || msg.sender == owner(),
            "CredChain: Only authorized calculators can call this function"
        );
        _;
    }
    
    modifier onlyAuthorizedOracle() {
        require(
            authorizedOracles[msg.sender] || msg.sender == owner(),
            "CredChain: Only authorized oracles can call this function"
        );
        _;
    }
    
    modifier validScore(uint256 _score) {
        require(
            _score >= MIN_SCORE && _score <= MAX_SCORE,
            "CredChain: Score must be between 0 and 1000"
        );
        _;
    }
    // Modificadores de segurança adicionais
    
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    modifier validAmount(uint256 _amount) {
        require(_amount > 0, "Amount must be greater than 0");
        _;
    }

    // Construtor
    constructor() {
        currentVersion = 1;
    }
    // Validações de entrada aprimoradas
    function _validateScoreInput(uint256 _score) internal pure {
        require(_score >= MIN_SCORE && _score <= MAX_SCORE, "Score must be between 0 and 1000");
    }
    
    function _validateAddress(address _addr) internal pure {
        require(_addr != address(0), "Invalid address");
    }
    
    function _validateString(string memory _str) internal pure {
        require(bytes(_str).length > 0, "String cannot be empty");
    }

    /**
     * @dev Atualiza o score de crédito de um usuário
     * @param _user Endereço do usuário
     * @param _score Novo score (0-1000)
     * @param _metadata Metadados adicionais
     */
    function updateCreditScore(
        address _user,
        uint256 _score,
        string memory _metadata
    ) 
        external 
        nonReentrant
        whenNotPaused
        onlyAuthorizedCalculator 
        validScore(_score) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        
        creditScores[_user] = CreditScore({
            score: _score,
            timestamp: block.timestamp,
            version: currentVersion,
            isValid: true,
            metadata: _metadata
        });

        emit ScoreUpdated(_user, _score, block.timestamp, currentVersion);
        emit SecurityEvent("ScoreUpdated", _user, block.timestamp, "Credit score updated");
    }

    /**
     * @dev Adiciona um fator de score para um usuário
     * @param _user Endereço do usuário
     * @param _factorName Nome do fator
     * @param _weight Peso do fator (0-100)
     * @param _value Valor do fator
     */
    function addScoreFactor(
        address _user,
        string memory _factorName,
        uint256 _weight,
        uint256 _value
    ) external onlyAuthorizedOracle {
        require(_user != address(0), "CredChain: Invalid user address");
        require(_weight <= 100, "CredChain: Weight must be <= 100");
        
        userScoreFactors[_user].push(ScoreFactor({
            name: _factorName,
            weight: _weight,
            value: _value,
            isActive: true
        }));

        emit ScoreFactorAdded(_user, _factorName, _weight, _value);
    }

    /**
     * @dev Calcula o score baseado nos fatores do usuário
     * @param _user Endereço do usuário
     * @return Calculated score
     */
    function calculateScore(address _user) 
        external 
        view 
        returns (uint256) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        
        ScoreFactor[] memory factors = userScoreFactors[_user];
        uint256 totalScore = 0;
        uint256 totalWeight = 0;
        
        for (uint256 i = 0; i < factors.length; i++) {
            if (factors[i].isActive) {
                totalScore += (factors[i].value * factors[i].weight) / 100;
                totalWeight += factors[i].weight;
            }
        }
        
        if (totalWeight == 0) {
            return 500; // Score neutro se não há fatores
        }
        
        uint256 calculatedScore = (totalScore * 100) / totalWeight;
        
        // Garantir que o score está dentro dos limites
        if (calculatedScore > MAX_SCORE) {
            calculatedScore = MAX_SCORE;
        }
        
        return calculatedScore;
    }

    /**
     * @dev Obtém o score atual de um usuário
     * @param _user Endereço do usuário
     * @return Score atual
     */
    function getCreditScore(address _user) 
        external 
        view 
        returns (uint256) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        require(creditScores[_user].isValid, "CredChain: No valid score found");
        
        return creditScores[_user].score;
    }

    /**
     * @dev Obtém informações completas do score
     * @param _user Endereço do usuário
     * @return score Score atual
     * @return timestamp Timestamp da última atualização
     * @return version Versão do algoritmo
     * @return isValid Se o score está válido
     * @return metadata Metadados adicionais
     */
    function getCreditScoreInfo(address _user) 
        external 
        view 
        returns (
            uint256 score,
            uint256 timestamp,
            uint256 version,
            bool isValid,
            string memory metadata
        ) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        
        CreditScore memory scoreInfo = creditScores[_user];
        return (
            scoreInfo.score,
            scoreInfo.timestamp,
            scoreInfo.version,
            scoreInfo.isValid,
            scoreInfo.metadata
        );
    }

    /**
     * @dev Obtém todos os fatores de score de um usuário
     * @param _user Endereço do usuário
     * @return Array de fatores
     */
    function getUserScoreFactors(address _user) 
        external 
        view 
        returns (ScoreFactor[] memory) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        return userScoreFactors[_user];
    }

    /**
     * @dev Autoriza um calculador de score
     * @param _calculator Endereço do calculador
     */
    function authorizeCalculator(address _calculator) 
        external 
        onlyOwner 
    {
        require(_calculator != address(0), "CredChain: Invalid calculator address");
        authorizedCalculators[_calculator] = true;
        emit AccessGranted(_calculator, "Calculator", block.timestamp);
        emit SecurityEvent("AccessGranted", _calculator, block.timestamp, "Calculator authorization granted");
    }

    /**
     * @dev Remove autorização de um calculador
     * @param _calculator Endereço do calculador
     */
    function revokeCalculator(address _calculator) 
        external 
        onlyOwner 
    {
        authorizedCalculators[_calculator] = false;
        emit AccessRevoked(_calculator, "Calculator", block.timestamp);
        emit SecurityEvent("AccessRevoked", _calculator, block.timestamp, "Calculator authorization revoked");
    }

    /**
     * @dev Autoriza um oráculo
     * @param _oracle Endereço do oráculo
     */
    function authorizeOracle(address _oracle) 
        external 
        onlyOwner 
    {
        require(_oracle != address(0), "CredChain: Invalid oracle address");
        authorizedOracles[_oracle] = true;
    }

    /**
     * @dev Remove autorização de um oráculo
     * @param _oracle Endereço do oráculo
     */
    function revokeOracle(address _oracle) 
        external 
        onlyOwner 
    {
        authorizedOracles[_oracle] = false;
    }

    /**
     * @dev Atualiza a versão do algoritmo
     * @param _newVersion Nova versão
     */
    function updateVersion(uint256 _newVersion) 
        external 
        onlyOwner 
    {
        require(_newVersion > currentVersion, "CredChain: Version must be greater than current");
        currentVersion = _newVersion;
    }

    /**
     * @dev Invalida o score de um usuário
     * @param _user Endereço do usuário
     */
    function invalidateScore(address _user) 
        external 
        onlyOwner 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        creditScores[_user].isValid = false;
    }

    /**
     * @dev Verifica se um usuário tem score válido
     * @param _user Endereço do usuário
     * @return True se tem score válido
     */
    function hasValidScore(address _user) 
        external 
        view 
        returns (bool) 
    {
        return creditScores[_user].isValid;
    }

    /**
     * @dev Obtém estatísticas do contrato
     * @return version Versão atual
     * @return maxScore Score máximo
     * @return minScore Score mínimo
     */
    function getContractInfo() 
        external 
        view 
        returns (
            uint256 version,
            uint256 maxScore,
            uint256 minScore
        ) 
    {
        return (currentVersion, MAX_SCORE, MIN_SCORE);
    }

    /**
     * @dev Pausa o contrato em caso de emergência
     * @param _reason Motivo da pausa
     */
    function pauseContract(string memory _reason) 
        external 
        onlyOwner 
    {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp, _reason);
        emit SecurityEvent("ContractPaused", msg.sender, block.timestamp, _reason);
    }

    /**
     * @dev Despausa o contrato
     */
    function unpauseContract() 
        external 
        onlyOwner 
    {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
        emit SecurityEvent("ContractUnpaused", msg.sender, block.timestamp, "Contract unpaused");
    }

    /**
     * @dev Função de emergência para invalidação de score
     * @param _user Endereço do usuário
     * @param _reason Motivo da invalidação
     */
    function emergencyInvalidateScore(address _user, string memory _reason) 
        external 
        onlyOwner 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        creditScores[_user].isValid = false;
        emit SecurityEvent("EmergencyInvalidation", _user, block.timestamp, _reason);
    }
}
