from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Proposal, ProposalAnswer, Signature, ProposalComment, ProposalStatusChange

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ProposalAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalAnswer
        fields = ['id', 'question_id', 'question_text', 'answer', 'created_at']
        read_only_fields = ['created_at']

class SignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signature
        fields = ['signature_id', 'signature_url', 'signature_date', 'is_signed', 'provider', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ProposalCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProposalComment
        fields = ['id', 'author', 'author_id', 'text', 'is_internal', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ProposalStatusChangeSerializer(serializers.ModelSerializer):
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProposalStatusChange
        fields = ['id', 'previous_status', 'new_status', 'changed_by', 'reason', 'created_at']
        read_only_fields = ['created_at']

class ProposalListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'user', 'credit_type', 'amount_requested', 'installments',
            'status', 'potential_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ProposalDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    answers = ProposalAnswerSerializer(many=True, read_only=True)
    signature = SignatureSerializer(read_only=True)
    comments = ProposalCommentSerializer(many=True, read_only=True)
    status_changes = ProposalStatusChangeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Proposal
        fields = [
            'id', 'user', 'credit_type', 'amount_requested', 'installments',
            'status', 'potential_rating', 'interest_rate', 'amount_approved',
            'installment_value', 'notes', 'created_at', 'updated_at',
            'answers', 'signature', 'comments', 'status_changes'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ProposalCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    
    class Meta:
        model = Proposal
        fields = [
            'user_id', 'credit_type', 'amount_requested', 
            'installments', 'notes'
        ]
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        user = User.objects.get(id=user_id)
        proposal = Proposal.objects.create(user=user, **validated_data)
        return proposal

class ProposalUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'status', 'potential_rating', 'interest_rate', 
            'amount_approved', 'installment_value', 'notes'
        ] 