// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CredChainOracleIntegration
 * @dev Smart contract para integração com oráculos externos no CredChain
 * @author CredChain Team
 * @notice Este contrato gerencia dados de oráculos para cálculo de credit scoring
 */
contract CredChainOracleIntegration {
    // Estruturas de dados
    struct OracleData {
        string key;              // Chave do dado (ex: "exchange_rate_USD_BRL")
        string value;           // Valor do dado (JSON)
        uint256 timestamp;      // Timestamp da última atualização
        address oracle;         // Endereço do oráculo que forneceu o dado
        bool isValid;          // Se o dado está válido
        string metadata;       // Metadados adicionais
    }

    struct OracleInfo {
        address oracleAddress;  // Endereço do oráculo
        string name;           // Nome do oráculo
        bool isActive;         // Se o oráculo está ativo
        uint256 lastUpdate;    // Última atualização
        uint256 updateCount;   // Número de atualizações
    }

    // Eventos
    event OracleDataUpdated(
        string indexed key,
        string value,
        address indexed oracle,
        uint256 timestamp
    );
    
    event OracleRegistered(
        address indexed oracle,
        string name,
        uint256 timestamp
    );
    
    event OracleDeactivated(
        address indexed oracle,
        uint256 timestamp
    );
    
    event DataExpired(
        string indexed key,
        uint256 timestamp
    );

    // Mapeamentos
    mapping(string => OracleData) public oracleData;
    mapping(address => OracleInfo) public oracles;
    mapping(address => bool) public authorizedOracles;
    mapping(string => address[]) public keyToOracles; // Chave -> oráculos que podem atualizar
    
    // Variáveis de estado
    address public owner;
    uint256 public constant DATA_EXPIRY = 24 hours; // Dados expiram em 24 horas
    uint256 public constant MAX_ORACLES = 100; // Máximo de oráculos
    
    // Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner, "CredChain: Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedOracle() {
        require(
            authorizedOracles[msg.sender] || msg.sender == owner,
            "CredChain: Only authorized oracles can call this function"
        );
        _;
    }
    
    modifier validKey(string memory _key) {
        require(bytes(_key).length > 0, "CredChain: Key cannot be empty");
        _;
    }
    
    modifier validValue(string memory _value) {
        require(bytes(_value).length > 0, "CredChain: Value cannot be empty");
        _;
    }

    // Construtor
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Registra um novo oráculo
     * @param _oracle Endereço do oráculo
     * @param _name Nome do oráculo
     */
    function registerOracle(
        address _oracle,
        string memory _name
    ) external onlyOwner {
        require(_oracle != address(0), "CredChain: Invalid oracle address");
        require(bytes(_name).length > 0, "CredChain: Oracle name cannot be empty");
        require(!oracles[_oracle].isActive, "CredChain: Oracle already registered");
        
        oracles[_oracle] = OracleInfo({
            oracleAddress: _oracle,
            name: _name,
            isActive: true,
            lastUpdate: 0,
            updateCount: 0
        });
        
        authorizedOracles[_oracle] = true;
        
        emit OracleRegistered(_oracle, _name, block.timestamp);
    }

    /**
     * @dev Desativa um oráculo
     * @param _oracle Endereço do oráculo
     */
    function deactivateOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "CredChain: Invalid oracle address");
        require(oracles[_oracle].isActive, "CredChain: Oracle not active");
        
        oracles[_oracle].isActive = false;
        authorizedOracles[_oracle] = false;
        
        emit OracleDeactivated(_oracle, block.timestamp);
    }

    /**
     * @dev Atualiza dados de oráculo
     * @param _key Chave do dado
     * @param _value Valor do dado
     * @param _metadata Metadados adicionais
     */
    function updateOracleData(
        string memory _key,
        string memory _value,
        string memory _metadata
    ) 
        external 
        onlyAuthorizedOracle 
        validKey(_key) 
        validValue(_value) 
    {
        require(oracles[msg.sender].isActive, "CredChain: Oracle not active");
        
        oracleData[_key] = OracleData({
            key: _key,
            value: _value,
            timestamp: block.timestamp,
            oracle: msg.sender,
            isValid: true,
            metadata: _metadata
        });
        
        oracles[msg.sender].lastUpdate = block.timestamp;
        oracles[msg.sender].updateCount++;
        
        emit OracleDataUpdated(_key, _value, msg.sender, block.timestamp);
    }

    /**
     * @dev Obtém dados de oráculo
     * @param _key Chave do dado
     * @return value Valor do dado
     * @return timestamp Timestamp da última atualização
     * @return oracle Endereço do oráculo
     * @return isValid Se os dados estão válidos
     */
    function getOracleData(string memory _key) 
        external 
        view 
        validKey(_key) 
        returns (
            string memory value,
            uint256 timestamp,
            address oracle,
            bool isValid
        ) 
    {
        OracleData memory data = oracleData[_key];
        
        // Verificar se os dados expiraram
        bool isExpired = block.timestamp > data.timestamp + DATA_EXPIRY;
        
        return (
            data.value,
            data.timestamp,
            data.oracle,
            data.isValid && !isExpired
        );
    }

    /**
     * @dev Obtém dados de oráculo com verificação de expiração
     * @param _key Chave do dado
     * @return value Valor do dado
     * @return timestamp Timestamp da última atualização
     * @return oracle Endereço do oráculo
     * @return isValid Se os dados estão válidos
     * @return isExpired Se os dados expiraram
     */
    function getOracleDataWithExpiry(string memory _key) 
        external 
        view 
        validKey(_key) 
        returns (
            string memory value,
            uint256 timestamp,
            address oracle,
            bool isValid,
            bool isExpired
        ) 
    {
        OracleData memory data = oracleData[_key];
        isExpired = block.timestamp > data.timestamp + DATA_EXPIRY;
        
        return (
            data.value,
            data.timestamp,
            data.oracle,
            data.isValid && !isExpired,
            isExpired
        );
    }

    /**
     * @dev Invalida dados de oráculo
     * @param _key Chave do dado
     */
    function invalidateOracleData(string memory _key) 
        external 
        onlyAuthorizedOracle 
        validKey(_key) 
    {
        oracleData[_key].isValid = false;
        
        emit DataExpired(_key, block.timestamp);
    }

    /**
     * @dev Obtém informações de um oráculo
     * @param _oracle Endereço do oráculo
     * @return name Nome do oráculo
     * @return isActive Se está ativo
     * @return lastUpdate Última atualização
     * @return updateCount Número de atualizações
     */
    function getOracleInfo(address _oracle) 
        external 
        view 
        returns (
            string memory name,
            bool isActive,
            uint256 lastUpdate,
            uint256 updateCount
        ) 
    {
        OracleInfo memory oracle = oracles[_oracle];
        return (
            oracle.name,
            oracle.isActive,
            oracle.lastUpdate,
            oracle.updateCount
        );
    }

    /**
     * @dev Verifica se um oráculo está ativo
     * @param _oracle Endereço do oráculo
     * @return True se o oráculo está ativo
     */
    function isOracleActive(address _oracle) 
        external 
        view 
        returns (bool) 
    {
        return oracles[_oracle].isActive;
    }

    /**
     * @dev Verifica se dados estão válidos e não expirados
     * @param _key Chave do dado
     * @return True se os dados estão válidos
     */
    function isDataValid(string memory _key) 
        external 
        view 
        validKey(_key) 
        returns (bool) 
    {
        OracleData memory data = oracleData[_key];
        bool isExpired = block.timestamp > data.timestamp + DATA_EXPIRY;
        
        return data.isValid && !isExpired;
    }

    /**
     * @dev Obtém timestamp da última atualização
     * @param _key Chave do dado
     * @return Timestamp da última atualização
     */
    function getLastUpdateTime(string memory _key) 
        external 
        view 
        validKey(_key) 
        returns (uint256) 
    {
        return oracleData[_key].timestamp;
    }

    /**
     * @dev Obtém oráculo que forneceu os dados
     * @param _key Chave do dado
     * @return Endereço do oráculo
     */
    function getDataOracle(string memory _key) 
        external 
        view 
        validKey(_key) 
        returns (address) 
    {
        return oracleData[_key].oracle;
    }

    /**
     * @dev Obtém metadados dos dados
     * @param _key Chave do dado
     * @return Metadados
     */
    function getDataMetadata(string memory _key) 
        external 
        view 
        validKey(_key) 
        returns (string memory) 
    {
        return oracleData[_key].metadata;
    }

    /**
     * @dev Obtém estatísticas do contrato
     * @return totalOracles Total de oráculos
     * @return activeOracles Oráculos ativos
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalOracles,
            uint256 activeOracles
        ) 
    {
        // Nota: Esta implementação é simplificada
        // Em uma implementação real, você manteria contadores
        return (0, 0);
    }

    /**
     * @dev Obtém todos os oráculos ativos
     * @return Array de endereços dos oráculos ativos
     */
    function getActiveOracles() 
        external 
        view 
        returns (address[] memory) 
    {
        // Nota: Esta implementação é simplificada
        // Em uma implementação real, você manteria uma lista de oráculos
        return new address[](0);
    }
}
