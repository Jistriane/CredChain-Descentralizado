# CredChain Infrastructure as Code
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
resource "aws_eks_cluster" "credchain" {
  name     = "credchain-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = aws_subnet.credchain[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster,
    aws_iam_role_policy_attachment.eks_service,
  ]
}

# EKS Node Group
resource "aws_eks_node_group" "credchain" {
  cluster_name    = aws_eks_cluster.credchain.name
  node_group_name = "credchain-nodes"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.credchain[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
  ]
}

# RDS PostgreSQL
resource "aws_db_instance" "credchain_postgres" {
  identifier = "credchain-postgres"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  storage_type = "gp2"
  
  db_name  = "credchain"
  username = "credchain"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.credchain.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = true
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "credchain" {
  name       = "credchain-redis"
  subnet_ids = aws_subnet.credchain[*].id
}

resource "aws_elasticache_replication_group" "credchain" {
  replication_group_id       = "credchain-redis"
  description                = "CredChain Redis Cluster"
  
  node_type            = "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = 2
  
  subnet_group_name  = aws_elasticache_subnet_group.credchain.name
  security_group_ids = [aws_security_group.redis.id]
}

# Application Load Balancer
resource "aws_lb" "credchain" {
  name               = "credchain-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.credchain[*].id
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Outputs
output "cluster_endpoint" {
  value = aws_eks_cluster.credchain.endpoint
}

output "cluster_security_group_id" {
  value = aws_eks_cluster.credchain.vpc_config[0].cluster_security_group_id
}
