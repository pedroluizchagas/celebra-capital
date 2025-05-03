from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocrresult',
            name='current_progress',
            field=models.IntegerField(default=0, help_text='Progresso atual de 0-100'),
        ),
        migrations.AddField(
            model_name='ocrresult',
            name='retry_count',
            field=models.IntegerField(default=0, help_text='Número de tentativas de processamento'),
        ),
        migrations.AddField(
            model_name='ocrresult',
            name='last_error_timestamp',
            field=models.DateTimeField(blank=True, help_text='Última vez que ocorreu erro', null=True),
        ),
        migrations.CreateModel(
            name='OcrResultCache',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(max_length=50)),
                ('document_hash', models.CharField(help_text='Hash do conteúdo do documento', max_length=64, unique=True)),
                ('extracted_data', models.JSONField()),
                ('confidence_score', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_used_at', models.DateTimeField(auto_now=True)),
                ('use_count', models.IntegerField(default=1, help_text='Número de vezes que este cache foi usado')),
            ],
            options={
                'verbose_name': 'Cache de OCR',
                'verbose_name_plural': 'Caches de OCR',
            },
        ),
        migrations.AddIndex(
            model_name='ocrresultcache',
            index=models.Index(fields=['document_type', 'document_hash'], name='documents_o_documen_2e432f_idx'),
        ),
    ] 