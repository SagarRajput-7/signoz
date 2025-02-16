package integrations

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"go.signoz.io/signoz/pkg/query-service/agentConf"
	"go.signoz.io/signoz/pkg/query-service/app/dashboards"
	"go.signoz.io/signoz/pkg/query-service/app/logparsingpipeline"
	"go.signoz.io/signoz/pkg/query-service/model"
)

type Controller struct {
	mgr *Manager
}

func NewController(db *sqlx.DB) (
	*Controller, error,
) {
	mgr, err := NewManager(db)
	if err != nil {
		return nil, fmt.Errorf("couldn't create integrations manager: %w", err)
	}

	return &Controller{
		mgr: mgr,
	}, nil
}

type IntegrationsListResponse struct {
	Integrations []IntegrationsListItem `json:"integrations"`

	// Pagination details to come later
}

func (c *Controller) ListIntegrations(
	ctx context.Context, params map[string]string,
) (
	*IntegrationsListResponse, *model.ApiError,
) {
	var filters *IntegrationsFilter
	if isInstalledFilter, exists := params["is_installed"]; exists {
		isInstalled := !(isInstalledFilter == "false")
		filters = &IntegrationsFilter{
			IsInstalled: &isInstalled,
		}
	}

	integrations, apiErr := c.mgr.ListIntegrations(ctx, filters)
	if apiErr != nil {
		return nil, apiErr
	}

	return &IntegrationsListResponse{
		Integrations: integrations,
	}, nil
}

func (c *Controller) GetIntegration(
	ctx context.Context, integrationId string,
) (*Integration, *model.ApiError) {
	return c.mgr.GetIntegration(ctx, integrationId)
}

func (c *Controller) GetIntegrationConnectionTests(
	ctx context.Context, integrationId string,
) (*IntegrationConnectionTests, *model.ApiError) {
	return c.mgr.GetIntegrationConnectionTests(ctx, integrationId)
}

type InstallIntegrationRequest struct {
	IntegrationId string                 `json:"integration_id"`
	Config        map[string]interface{} `json:"config"`
}

func (c *Controller) Install(
	ctx context.Context, req *InstallIntegrationRequest,
) (*IntegrationsListItem, *model.ApiError) {
	res, apiErr := c.mgr.InstallIntegration(
		ctx, req.IntegrationId, req.Config,
	)
	if apiErr != nil {
		return nil, apiErr
	}
	agentConf.NotifyConfigUpdate(ctx)
	return res, nil
}

type UninstallIntegrationRequest struct {
	IntegrationId string `json:"integration_id"`
}

func (c *Controller) Uninstall(
	ctx context.Context, req *UninstallIntegrationRequest,
) *model.ApiError {
	if len(req.IntegrationId) < 1 {
		return model.BadRequest(fmt.Errorf(
			"integration_id is required.",
		))
	}

	apiErr := c.mgr.UninstallIntegration(
		ctx, req.IntegrationId,
	)
	if apiErr != nil {
		return apiErr
	}
	agentConf.NotifyConfigUpdate(ctx)
	return nil
}

func (c *Controller) GetPipelinesForInstalledIntegrations(
	ctx context.Context,
) ([]logparsingpipeline.Pipeline, *model.ApiError) {
	return c.mgr.GetPipelinesForInstalledIntegrations(ctx)
}

func (c *Controller) GetDashboardsForInstalledIntegrations(
	ctx context.Context,
) ([]dashboards.Dashboard, *model.ApiError) {
	return c.mgr.GetDashboardsForInstalledIntegrations(ctx)
}

func (c *Controller) GetInstalledIntegrationDashboardById(
	ctx context.Context, dashboardUuid string,
) (*dashboards.Dashboard, *model.ApiError) {
	return c.mgr.GetInstalledIntegrationDashboardById(ctx, dashboardUuid)
}
