package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/afrizadwi21/distribucore/apps/api/internal/middleware"
	"github.com/afrizadwi21/distribucore/apps/api/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email, password, or tenant code")
	ErrUserInactive       = errors.New("user account is deactivated")
)

type TokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	Tenant       *repository.Tenant `json:"tenant"`
	User         *repository.User   `json:"user"`
}

type AuthService struct {
	repo      *repository.AuthRepository
	jwtSecret string
	expiryHrs int
}

func NewAuthService(repo *repository.AuthRepository, jwtSecret string, expiryHrs int) *AuthService {
	return &AuthService{
		repo:      repo,
		jwtSecret: jwtSecret,
		expiryHrs: expiryHrs,
	}
}

// RegisterTenant creates a new tenant organization and its root admin user.
func (s *AuthService) RegisterTenant(ctx context.Context, tenantCode, tenantName, email, password, fullName string) (*TokenPair, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	tenant, user, err := s.repo.CreateTenantWithAdmin(ctx, tenantCode, tenantName, email, string(hashedPassword), fullName)
	if err != nil {
		return nil, err
	}

	tokens, err := s.generateTokens(user, tenant)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}

// Login authenticates a user and returns a signed JWT token pair.
func (s *AuthService) Login(ctx context.Context, tenantCode, email, password string) (*TokenPair, error) {
	user, tenant, err := s.repo.GetUserByEmailWithRoles(ctx, tenantCode, email)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, ErrUserInactive
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	_ = s.repo.UpdateLastLogin(ctx, user.ID)

	return s.generateTokens(user, tenant)
}

// GetCurrentUser returns profile information for the authenticated user.
func (s *AuthService) GetCurrentUser(ctx context.Context, tenantID, userID uuid.UUID) (*repository.User, error) {
	return s.repo.GetUserByID(ctx, tenantID, userID)
}

func (s *AuthService) generateTokens(user *repository.User, tenant *repository.Tenant) (*TokenPair, error) {
	expiresAt := time.Now().Add(time.Duration(s.expiryHrs) * time.Hour)

	claims := &middleware.JWTClaims{
		UserID:   user.ID,
		TenantID: user.TenantID,
		Email:    user.Email,
		Roles:    user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "distribucore-api",
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	// Generate refresh token (valid for 7 days)
	refreshClaims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "distribucore-api",
		Subject:   user.ID.String(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  tokenString,
		RefreshToken: refreshTokenString,
		ExpiresAt:    expiresAt,
		Tenant:       tenant,
		User:         user,
	}, nil
}
