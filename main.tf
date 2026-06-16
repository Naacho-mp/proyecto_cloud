provider "aws" {
  region = "sa-east-1"
}

# VPC y subnets públicas (usamos la default)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ssm_parameter" "amzn2_ami" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}


# Security Groups
resource "aws_security_group" "alb" {
  name   = "alb-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ec2_fastapi" {
  name   = "fastapi-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["181.42.182.169/32"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ec2_java" {
  name   = "java-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["181.42.182.169/32"]  # <-- CAMBIA ESTO POR TU IP REAL
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 para FastAPI (t3.small)
resource "aws_instance" "fastapi" {
  ami                    = data.aws_ssm_parameter.amzn2_ami.value # Amazon Linux 2 (sa-east-1)
  instance_type          = "t3.small"
  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [aws_security_group.ec2_fastapi.id]
  key_name               = "keycloudterraform"   # <-- CAMBIA POR EL NOMBRE DE TU KEY PAIR
  user_data = <<-EOF
    #!/bin/bash
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
  EOF
  tags = { Name = "fastapi-server" }
}

# EC2 para Java
resource "aws_instance" "java" {
  ami                    = data.aws_ssm_parameter.amzn2_ami.value
  instance_type          = "t3.small"
  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [aws_security_group.ec2_java.id]
  key_name               = "keycloudterraform"   # <-- CAMBIA POR EL NOMBRE DE TU KEY PAIR
  user_data = <<-EOF
    #!/bin/bash
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
  EOF
  tags = { Name = "java-server" }
}

# Elastic IPs para IPs públicas fijas
resource "aws_eip" "fastapi_eip" {
  instance = aws_instance.fastapi.id
}

resource "aws_eip" "java_eip" {
  instance = aws_instance.java.id
}

# Target Groups
resource "aws_lb_target_group" "fastapi" {
  name     = "fastapi-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/api/health"
  }
}

resource "aws_lb_target_group" "java" {
  name     = "java-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/java/health"
  }
}

# Attach EC2 instances to target groups
resource "aws_lb_target_group_attachment" "fastapi_attach" {
  target_group_arn = aws_lb_target_group.fastapi.arn
  target_id        = aws_instance.fastapi.id
  port             = 8000
}

resource "aws_lb_target_group_attachment" "java_attach" {
  target_group_arn = aws_lb_target_group.java.arn
  target_id        = aws_instance.java.id
  port             = 8080
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "proyecto-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.public.ids
}

# Listener HTTP
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "OK"
      status_code  = "200"
    }
  }
}

# Reglas del listener
resource "aws_lb_listener_rule" "fastapi" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fastapi.arn
  }
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "java" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.java.arn
  }
  condition {
    path_pattern {
      values = ["/java/*"]
    }
  }
}

# S3 para frontend React
resource "aws_s3_bucket" "frontend" {
  bucket = "mi-app-react-${random_id.bucket_suffix.hex}"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

#resource "aws_s3_bucket_public_access_block" "frontend_block" {
 # bucket = aws_s3_bucket.frontend.id
  #block_public_acls       = false
  #block_public_policy     = false
  #ignore_public_acls      = false
  #restrict_public_buckets = false
#}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.s3_cloudfront_policy.json
}

data "aws_iam_policy_document" "s3_cloudfront_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

# CloudFront para S3
# CloudFront para S3 + ALB
resource "aws_cloudfront_distribution" "frontend" {
  # Origen para S3 (frontend estático)
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id
  }

  # Origen para el ALB (backend)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALBOrigin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  default_root_object = "index.html"

  # Comportamiento por defecto: S3 (frontend)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
  }

  # Comportamiento para /api/* -> ALB
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALBOrigin"
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
      cookies {
        forward = "all"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # Comportamiento para /java/* -> ALB
  ordered_cache_behavior {
    path_pattern     = "/java/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALBOrigin"
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
      cookies {
        forward = "all"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_control" "frontend_oac" {
  name                              = "oac-frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Outputs útiles
output "alb_dns" {
  value = aws_lb.main.dns_name
}

output "cloudfront_dns" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "fastapi_public_ip" {
  value = aws_eip.fastapi_eip.public_ip
}

output "java_public_ip" {
  value = aws_eip.java_eip.public_ip
}

output "bucket_name" {
  value = aws_s3_bucket.frontend.id
}