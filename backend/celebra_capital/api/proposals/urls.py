from django.urls import path
from .views import (
    ProposalCreateView, 
    SimulationView, 
    ProposalListAdminView,
    ProposalDetailAdminView,
    ProposalApproveView,
    ProposalRejectView,
    RequestDocumentsView,
    reports_stats,
    reports_chart,
    export_report
)

app_name = 'proposals'

urlpatterns = [
    path('', ProposalCreateView.as_view(), name='proposal-create'),
    path('<int:pk>/', ProposalDetailAdminView.as_view(), name='proposal-detail'),
    path('<int:proposal_id>/answers/', ProposalAnswersView.as_view(), name='proposal-answers'),
    path('simulate/', SimulationView.as_view(), name='proposal-simulate'),
    path('<int:proposal_id>/signature/', SignatureView.as_view(), name='signature'),
    path('admin/potential/', PotentialProposalsView.as_view(), name='admin-potential'),
    
    # Rotas administrativas
    path('admin/', ProposalListAdminView.as_view(), name='admin-proposal-list'),
    path('admin/<int:pk>/approve/', ProposalApproveView.as_view(), name='admin-proposal-approve'),
    path('admin/<int:pk>/reject/', ProposalRejectView.as_view(), name='admin-proposal-reject'),
    path('admin/<int:pk>/request-documents/', RequestDocumentsView.as_view(), name='admin-request-documents'),
    path('admin/export/', ProposalListAdminView.as_view(), name='admin-proposal-export'),
    
    # Rotas de relatórios
    path('admin/reports/stats/', reports_stats, name='admin-reports-stats'),
    path('admin/reports/chart/', reports_chart, name='admin-reports-chart'),
    path('admin/reports/export/', export_report, name='admin-reports-export'),
] 