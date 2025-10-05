// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CredChainPaymentRegistry
 * @dev Smart contract para registro de pagamentos no CredChain
 * @author CredChain Team
 * @notice Este contrato registra e valida pagamentos para cálculo de credit scoring
 */
contract CredChainPaymentRegistry is ReentrancyGuard, Ownable, Pausable {
    // Estruturas de dados
    struct Payment {
        uint256 id;             // ID único do pagamento
        address payer;          // Endereço do pagador
        address payee;          // Endereço do recebedor
        uint256 amount;         // Valor do pagamento
        uint256 dueDate;        // Data de vencimento
        uint256 paidDate;       // Data do pagamento
        PaymentStatus status;   // Status do pagamento
        string description;     // Descrição do pagamento
        string metadata;        // Metadados adicionais (JSON)
        bool isVerified;        // Se o pagamento foi verificado
    }

    enum PaymentStatus {
        Pending,    // Pendente
        Paid,       // Pago
        Late,       // Atrasado
        Defaulted,  // Inadimplente
        Cancelled   // Cancelado
    }

    // Eventos
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 dueDate
    );
    
    event PaymentMade(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 paidDate
    );
    
    event PaymentStatusChanged(
        uint256 indexed paymentId,
        PaymentStatus oldStatus,
        PaymentStatus newStatus
    );
    
    event PaymentVerified(
        uint256 indexed paymentId,
        address indexed verifier,
        bool isVerified
    );


    // Eventos de auditoria
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
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public userPayments;
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => bool) public authorizedOracles;
    
    // Variáveis de estado
        uint256 public nextPaymentId;
    uint256 public constant LATE_PAYMENT_THRESHOLD = 7 days; // 7 dias para considerar atrasado
    uint256 public constant DEFAULT_THRESHOLD = 30 days;     // 30 dias para considerar inadimplente
    
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
    
    modifier validPayment(uint256 _paymentId) {
        require(_paymentId < nextPaymentId, "CredChain: Payment does not exist");
        _;
    }
    
    modifier onlyPayerOrPayee(uint256 _paymentId) {
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.payer || msg.sender == payment.payee,
            "CredChain: Only payer or payee can perform this action"
        );
        _;
    }

    // Construtor
    constructor() {
                nextPaymentId = 1;
    }

    /**
     * @dev Cria um novo pagamento
     * @param _payee Endereço do recebedor
     * @param _amount Valor do pagamento
     * @param _dueDate Data de vencimento
     * @param _description Descrição do pagamento
     * @param _metadata Metadados adicionais
     * @return ID do pagamento criado
     */
    function createPayment(
        address _payee,
        uint256 _amount,
        uint256 _dueDate,
        string memory _description,
        string memory _metadata
    ) external returns (uint256) {
        require(_payee != address(0), "CredChain: Invalid payee address");
        require(_amount > 0, "CredChain: Amount must be greater than 0");
        require(_dueDate > block.timestamp, "CredChain: Due date must be in the future");
        
        uint256 paymentId = nextPaymentId++;
        
        payments[paymentId] = Payment({
            id: paymentId,
            payer: msg.sender,
            payee: _payee,
            amount: _amount,
            dueDate: _dueDate,
            paidDate: 0,
            status: PaymentStatus.Pending,
            description: _description,
            metadata: _metadata,
            isVerified: false
        });
        
        userPayments[msg.sender].push(paymentId);
        userPayments[_payee].push(paymentId);
        
        emit PaymentCreated(paymentId, msg.sender, _payee, _amount, _dueDate);
        
        return paymentId;
    }

    /**
     * @dev Registra um pagamento como pago
     * @param _paymentId ID do pagamento
     */
    function markAsPaid(uint256 _paymentId) 
        external 
        validPayment(_paymentId) 
        onlyPayerOrPayee(_paymentId) 
    {
        Payment storage payment = payments[_paymentId];
        require(
            payment.status == PaymentStatus.Pending,
            "CredChain: Payment is not pending"
        );
        
        payment.status = PaymentStatus.Paid;
        payment.paidDate = block.timestamp;
        
        emit PaymentMade(_paymentId, payment.payer, payment.amount, block.timestamp);
        emit PaymentStatusChanged(_paymentId, PaymentStatus.Pending, PaymentStatus.Paid);
    }

    /**
     * @dev Atualiza o status de um pagamento
     * @param _paymentId ID do pagamento
     * @param _newStatus Novo status
     */
    function updatePaymentStatus(
        uint256 _paymentId,
        PaymentStatus _newStatus
    ) 
        external 
        validPayment(_paymentId) 
        onlyAuthorizedVerifier 
    {
        Payment storage payment = payments[_paymentId];
        PaymentStatus oldStatus = payment.status;
        
        payment.status = _newStatus;
        
        if (_newStatus == PaymentStatus.Paid && payment.paidDate == 0) {
            payment.paidDate = block.timestamp;
        }
        
        emit PaymentStatusChanged(_paymentId, oldStatus, _newStatus);
    }

    /**
     * @dev Verifica um pagamento
     * @param _paymentId ID do pagamento
     * @param _isVerified Se o pagamento foi verificado
     */
    function verifyPayment(
        uint256 _paymentId,
        bool _isVerified
    ) 
        external 
        validPayment(_paymentId) 
        onlyAuthorizedVerifier 
    {
        payments[_paymentId].isVerified = _isVerified;
        
        emit PaymentVerified(_paymentId, msg.sender, _isVerified);
    }

    /**
     * @dev Atualiza automaticamente o status dos pagamentos baseado na data
     * @param _paymentId ID do pagamento
     */
    function updatePaymentStatusByDate(uint256 _paymentId) 
        external 
        validPayment(_paymentId) 
    {
        Payment storage payment = payments[_paymentId];
        
        if (payment.status == PaymentStatus.Pending) {
            uint256 daysPastDue = (block.timestamp - payment.dueDate) / 1 days;
            
            if (daysPastDue >= DEFAULT_THRESHOLD / 1 days) {
                payment.status = PaymentStatus.Defaulted;
                emit PaymentStatusChanged(_paymentId, PaymentStatus.Pending, PaymentStatus.Defaulted);
            } else if (daysPastDue >= LATE_PAYMENT_THRESHOLD / 1 days) {
                payment.status = PaymentStatus.Late;
                emit PaymentStatusChanged(_paymentId, PaymentStatus.Pending, PaymentStatus.Late);
            }
        }
    }

    /**
     * @dev Obtém informações de um pagamento
     * @param _paymentId ID do pagamento
     * @return id ID do pagamento
     * @return payer Endereço do pagador
     * @return payee Endereço do recebedor
     * @return amount Valor do pagamento
     * @return dueDate Data de vencimento
     * @return paidDate Data do pagamento
     * @return status Status do pagamento
     * @return description Descrição do pagamento
     * @return metadata Metadados adicionais
     * @return isVerified Se foi verificado
     */
    function getPayment(uint256 _paymentId) 
        external 
        view 
        validPayment(_paymentId) 
        returns (
            uint256 id,
            address payer,
            address payee,
            uint256 amount,
            uint256 dueDate,
            uint256 paidDate,
            PaymentStatus status,
            string memory description,
            string memory metadata,
            bool isVerified
        ) 
    {
        Payment memory payment = payments[_paymentId];
        return (
            payment.id,
            payment.payer,
            payment.payee,
            payment.amount,
            payment.dueDate,
            payment.paidDate,
            payment.status,
            payment.description,
            payment.metadata,
            payment.isVerified
        );
    }

    /**
     * @dev Obtém todos os pagamentos de um usuário
     * @param _user Endereço do usuário
     * @return Array de IDs dos pagamentos
     */
    function getUserPayments(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        return userPayments[_user];
    }

    /**
     * @dev Obtém pagamentos por status
     * @param _user Endereço do usuário
     * @param _status Status dos pagamentos
     * @return Array de IDs dos pagamentos
     */
    function getPaymentsByStatus(address _user, PaymentStatus _status) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        
        uint256[] memory userPaymentIds = userPayments[_user];
        uint256[] memory filteredPayments = new uint256[](userPaymentIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < userPaymentIds.length; i++) {
            if (payments[userPaymentIds[i]].status == _status) {
                filteredPayments[count] = userPaymentIds[i];
                count++;
            }
        }
        
        // Redimensionar array para o tamanho correto
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = filteredPayments[i];
        }
        
        return result;
    }

    /**
     * @dev Calcula estatísticas de pagamento de um usuário
     * @param _user Endereço do usuário
     * @return totalPayments Total de pagamentos
     * @return paidPayments Pagamentos realizados
     * @return latePayments Pagamentos atrasados
     * @return defaultedPayments Pagamentos inadimplentes
     */
    function getUserPaymentStats(address _user) 
        external 
        view 
        returns (
            uint256 totalPayments,
            uint256 paidPayments,
            uint256 latePayments,
            uint256 defaultedPayments
        ) 
    {
        require(_user != address(0), "CredChain: Invalid user address");
        
        uint256[] memory userPaymentIds = userPayments[_user];
        
        for (uint256 i = 0; i < userPaymentIds.length; i++) {
            PaymentStatus status = payments[userPaymentIds[i]].status;
            totalPayments++;
            
            if (status == PaymentStatus.Paid) {
                paidPayments++;
            } else if (status == PaymentStatus.Late) {
                latePayments++;
            } else if (status == PaymentStatus.Defaulted) {
                defaultedPayments++;
            }
        }
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
     * @return totalPayments Total de pagamentos
     * @return nextId Próximo ID
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalPayments,
            uint256 nextId
        ) 
    {
        return (nextPaymentId - 1, nextPaymentId);
    }
}
