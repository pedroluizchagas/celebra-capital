from django.urls import path
from . import views

app_name = 'proposals'

urlpatterns = [
    path('proposals/', views.ProposalListCreateView.as_view(), name='proposal-list-create'),
    path('proposals/<int:pk>/', views.ProposalDetailView.as_view(), name='proposal-detail'),
    path('proposals/<int:proposal_id>/answers/', views.ProposalAnswersView.as_view(), name='proposal-answers'),
    path('proposals/<int:proposal_id>/comments/', views.ProposalCommentView.as_view(), name='proposal-comments'),
    path('proposals/<int:pk>/approve/', views.ProposalApproveView.as_view(), name='proposal-approve'),
    path('proposals/<int:pk>/reject/', views.ProposalRejectView.as_view(), name='proposal-reject'),
    path('proposals/<int:pk>/request-documents/', views.RequestDocumentsView.as_view(), name='proposal-request-documents'),
    path('proposals/<int:proposal_id>/signature/', views.SignatureView.as_view(), name='proposal-signature'),
    path('simulate-proposal/', views.SimulateProposalView.as_view(), name='simulate-proposal'),
    path('potential-proposals/', views.PotentialProposalsView.as_view(), name='potential-proposals'),
    path('reports/stats/', views.reports_stats, name='reports-stats'),
    path('reports/chart/', views.reports_chart, name='reports-chart'),
    path('reports/export/', views.export_report, name='export-report'),
] 