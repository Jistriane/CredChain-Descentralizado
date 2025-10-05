// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CredChainIdentityVerification
 * @dev Smart contract para verificação de identidade (KYC) no CredChain
 * @author CredChain Team
 * @notice Este contrato gerencia o processo de verificação de identidade dos usuários
 */
contract CredChainIdentityVerification is ReentrancyGuard, Ownable, Pausable {
    // Estruturas de dados
    struct IdentityInfo {
        string name;             // Nome completo
        string documentNumber;   // Número do documento
        string documentType;     // Tipo do documento (CPF, RG, Passport, etc.)
        string country;          // País
        string email;           // Email
        string phone;           // Telefone
        uint256 birthDate;      // Data de nascimento (timestamp)
        uint256 verificationDate; // Data da verificação
        bool isVerified;        // Se a identidade foi verificada
        string metadata;        // Metadados adicionais (JSON)
    }

    struct VerificationRequest {
        uint256 requestId;      // ID da solicitação
        address user;           // Endereço do usuário
        string documentHash;    // Hash do documento
        uint256 requestDate;    // Data da solicitação
        VerificationStatus status; // Status da verificação
        address verifier;       // Endereço do verificador
        string comments;        // Comentários do verificador
    }

    enum VerificationStatus {
        Pending,        // Pendente
        Approved,       // Aprovado
        Rejected,       // Rejeitado
        UnderReview,   // Em análise
        Expired        // Expirado
    }

    // Eventos
    event IdentityRegistered(
        address indexed user,
        string indexed documentNumber,
        string documentType,
        uint256 timestamp
    );
    
    event VerificationRequested(
        uint256 indexed requestId,
        address indexed user,
        string documentHash,
        uint256 timestamp
    );
    
    event VerificationCompleted(
        uint256 indexed requestId,
        address indexed user,
        VerificationStatus status,
        address indexed verifier
    );
    
    event IdentityVerified(
        address indexed user,
        bool isVerified,
        uint256 timestamp
    );

    // Mapeamentos
    mapping(address => IdentityInfo) public identities;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bool) public authorizedOracles;
    mapping(string => address) public documentToUser; // Hash do documento -> usuário
    
    // Variáveis de estado
        uint256 public nextRequestId;
    uint256 public constant VERIFICATION_EXPIRY = 30 days; // 30 dias para expirar
    
    // Modificadores
        modifier onlyAuthorizedVerifier() {
        require(
            authorizedVerifiers[msg.sender] || msg.sender == owner(),
            "CredChain: Only authorized verifiers can call this function"
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
    
    modifier validRequest(uint256 _requestId) {
        require(_requestId < nextRequestId, "CredChain: Request does not exist");
        _;
    }
    
    modifier notExpired(uint256 _requestId) {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(
            block.timestamp <= request.requestDate + VERIFICATION_EXPIRY,
            "CredChain: Request has expired"
        );
        _;
    }

    // Construtor
    constructor() {
                nextRequestId = 1;
    }

    /**
     * @dev Registra informações de identidade de um usuário
     * @param _name Nome completo
     * @param _documentNumber Número do documento
     * @param _documentType Tipo do documento
     * @param _country País
     * @param _email Email
     * @param _phone Telefone
     * @param _birthDate Data de nascimento
     * @param _metadata Metadados adicionais
     */
    function registerIdentity(
        string memory _name,
        string memory _documentNumber,
        string memory _documentType,
        string memory _country,
        string memory _email,
        string memory _phone,
        uint256 _birthDate,
        string memory _metadata
    ) external {
        require(bytes(_name).length > 0, "CredChain: Name cannot be empty");
        require(bytes(_documentNumber).length > 0, "CredChain: Document number cannot be empty");
        require(bytes(_documentType).length > 0, "CredChain: Document type cannot be empty");
        require(_birthDate > 0, "CredChain: Invalid birth date");
        
        // Verificar se o documento já está em uso
        string memory documentKey = string(abi.encodePacked(_documentType, _documentNumber));
        require(
            documentToUser[documentKey] == address(0),
            "CredChain: Document already registered"
        );
        
        identities[msg.sender] = IdentityInfo({
            name: _name,
            documentNumber: _documentNumber,
            documentType: _documentType,
            country: _country,
            email: _email,
            phone: _phone,
            birthDate: _birthDate,
            verificationDate: 0,
            isVerified: false,
            metadata: _metadata
        });
        
        documentToUser[documentKey] = msg.sender;
        
        emit IdentityRegistered(msg.sender, _documentNumber, _documentType, block.timestamp);
    }

    /**
     * @dev Solicita verificação de identidade
     * @param _documentHash Hash do documento para verificação
     * @return ID da solicitação
     */
    function requestVerification(string memory _documentHash) 
        external 
        returns (uint256) 
    {
        require(bytes(_documentHash).length > 0, "CredChain: Document hash cannot be empty");
        require(
            identities[msg.sender].verificationDate == 0,
            "CredChain: Identity already verified or verification in progress"
        );
        
        uint256 requestId = nextRequestId++;
        
        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            user: msg.sender,
            documentHash: _documentHash,
            requestDate: block.timestamp,
            status: VerificationStatus.Pending,
            verifier: address(0),
            comments: ""
        });
        
        emit VerificationRequested(requestId, msg.sender, _documentHash, block.timestamp);
        
        return requestId;
    }

    /**
     * @dev Completa a verificação de identidade
     * @param _requestId ID da solicitação
     * @param _status Status da verificação
     * @param _comments Comentários do verificador
     */
    function completeVerification(
        uint256 _requestId,
        VerificationStatus _status,
        string memory _comments
    ) 
        external 
        validRequest(_requestId) 
        notExpired(_requestId) 
        onlyAuthorizedVerifier 
    {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(
            request.status == VerificationStatus.Pending,
            "CredChain: Request is not pending"
        );
        
        request.status = _status;
        request.verifier = msg.sender;
        request.comments = _comments;
        
        if (_status == VerificationStatus.Approved) {
            identities[request.user].isVerified = true;
            identities[request.user].verificationDate = block.timestamp;
        }
        
        emit VerificationCompleted(_requestId, request.user, _status, msg.sender);
        
        if (_status == VerificationStatus.Approved) {
            emit IdentityVerified(request.user, true, block.timestamp);
        }
    }

    /**
     * @dev Atualiza informações de identidade (apenas se não verificado)
     * @param _name Novo nome
     * @param _email Novo email
     * @param _phone Novo telefone
     * @param _metadata Novos metadados
     */
    function updateIdentityInfo(
        string memory _name,
        string memory _email,
        string memory _phone,
        string memory _metadata
    ) external {
        require(!identities[msg.sender].isVerified, "CredChain: Cannot update verified identity");
        require(bytes(_name).length > 0, "CredChain: Name cannot be empty");
        
        identities[msg.sender].name = _name;
        identities[msg.sender].email = _email;
        identities[msg.sender].phone = _phone;
        identities[msg.sender].metadata = _metadata;
    }

    /**
     * @dev Obtém informações de identidade de um usuário
     * @param _user Endereço do usuário
     * @return name Nome completo
     * @return documentNumber Número do documento
     * @return documentType Tipo do documento
     * @return country País
     * @return email Email
     * @return phone Telefone
     * @return birthDate Data de nascimento
     * @return verificationDate Data da verificação
     * @return isVerified Se está verificado
     * @return metadata Metadados adicionais
     */
    function getIdentityInfo(address _user) 
        external 
        view 
        returns (
            string memory name,
            string memory documentNumber,
            string memory documentType,
            string memory country,
            string memory email,
            string memory phone,
            uint256 birthDate,
            uint256 verificationDate,
            bool isVerified,
            string memory metadata
        ) 
    {
        IdentityInfo memory identity = identities[_user];
        return (
            identity.name,
            identity.documentNumber,
            identity.documentType,
            identity.country,
            identity.email,
            identity.phone,
            identity.birthDate,
            identity.verificationDate,
            identity.isVerified,
            identity.metadata
        );
    }

    /**
     * @dev Obtém informações de uma solicitação de verificação
     * @param _requestId ID da solicitação
     * @return requestId ID da solicitação
     * @return user Endereço do usuário
     * @return documentHash Hash do documento
     * @return requestDate Data da solicitação
     * @return status Status da verificação
     * @return verifier Endereço do verificador
     * @return comments Comentários do verificador
     */
    function getVerificationRequest(uint256 _requestId) 
        external 
        view 
        validRequest(_requestId) 
        returns (
            uint256 requestId,
            address user,
            string memory documentHash,
            uint256 requestDate,
            VerificationStatus status,
            address verifier,
            string memory comments
        ) 
    {
        VerificationRequest memory request = verificationRequests[_requestId];
        return (
            request.requestId,
            request.user,
            request.documentHash,
            request.requestDate,
            request.status,
            request.verifier,
            request.comments
        );
    }

    /**
     * @dev Verifica se um usuário tem identidade verificada
     * @param _user Endereço do usuário
     * @return True se a identidade está verificada
     */
    function isIdentityVerified(address _user) 
        external 
        view 
        returns (bool) 
    {
        return identities[_user].isVerified;
    }

    /**
     * @dev Verifica se um documento já está registrado
     * @param _documentType Tipo do documento
     * @param _documentNumber Número do documento
     * @return True se o documento está registrado
     */
    function isDocumentRegistered(
        string memory _documentType,
        string memory _documentNumber
    ) 
        external 
        view 
        returns (bool) 
    {
        string memory documentKey = string(abi.encodePacked(_documentType, _documentNumber));
        return documentToUser[documentKey] != address(0);
    }

    /**
     * @dev Obtém o usuário associado a um documento
     * @param _documentType Tipo do documento
     * @param _documentNumber Número do documento
     * @return Endereço do usuário
     */
    function getDocumentOwner(
        string memory _documentType,
        string memory _documentNumber
    ) 
        external 
        view 
        returns (address) 
    {
        string memory documentKey = string(abi.encodePacked(_documentType, _documentNumber));
        return documentToUser[documentKey];
    }

    /**
     * @dev Autoriza um verificador
     * @param _verifier Endereço do verificador
     */
    function authorizeVerifier(address _verifier) 
        external 
        onlyOwner 
    {
        require(_verifier != address(0), "CredChain: Invalid verifier address");
        authorizedVerifiers[_verifier] = true;
    }

    /**
     * @dev Remove autorização de um verificador
     * @param _verifier Endereço do verificador
     */
    function revokeVerifier(address _verifier) 
        external 
        onlyOwner 
    {
        authorizedVerifiers[_verifier] = false;
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
     * @dev Obtém estatísticas do contrato
     * @return totalRequests Total de solicitações
     * @return nextId Próximo ID
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalRequests,
            uint256 nextId
        ) 
    {
        return (nextRequestId - 1, nextRequestId);
    }
}
