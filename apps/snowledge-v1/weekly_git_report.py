from git import Repo
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os

def get_weekly_commits(repo_path):
    # Calculer la date d'il y a une semaine
    one_week_ago = datetime.now() - timedelta(days=7)
    
    # Initialiser le repo
    repo = Repo(repo_path)
    
    # Récupérer tous les commits de la dernière semaine
    commits = []
    for commit in repo.iter_commits():
        commit_date = datetime.fromtimestamp(commit.committed_date)
        if commit_date > one_week_ago:
            commits.append({
                'date': commit_date.strftime('%Y-%m-%d %H:%M'),
                'message': commit.message.strip(),
                'hash': commit.hexsha[:7]
            })
    
    return commits

def format_commit_message(message):
    # Séparer les lignes
    lines = message.split('\n')
    formatted_lines = []
    
    for line in lines:
        # Si la ligne commence par un tiret, ajouter une indentation
        if line.strip().startswith('-'):
            formatted_lines.append('    • ' + line.strip()[1:])
        else:
            formatted_lines.append(line.strip())
    
    return '<br/>'.join(formatted_lines)

def generate_summary(commits):
    # Catégoriser les commits par thème
    categories = {
        'UI/UX': [],
        'Fonctionnalités': [],
        'API': [],
        'Améliorations': []
    }
    
    for commit in commits:
        main_point = commit['message'].split('\n')[0].strip().lower()
        
        # Catégoriser chaque commit
        if any(kw in main_point for kw in ['responsive', 'styling', 'ui', 'layout', 'design']):
            categories['UI/UX'].append(main_point)
        elif any(kw in main_point for kw in ['api', 'route']):
            categories['API'].append(main_point)
        elif any(kw in main_point for kw in ['add', 'implement', 'create']):
            categories['Fonctionnalités'].append(main_point)
        else:
            categories['Améliorations'].append(main_point)
    
    # Construire le résumé structuré
    summary_parts = ["Cette semaine, j'ai travaillé sur plusieurs aspects du projet :"]
    
    for category, points in categories.items():
        if points:
            summary_parts.append(f"\n\n{category} :")
            for point in points:
                # Nettoyer et formater chaque point
                clean_point = point.replace(' and ', ' et ')
                # Capitaliser la première lettre
                clean_point = clean_point[0].upper() + clean_point[1:]
                summary_parts.append(f"• {clean_point}")
    
    return '\n'.join(summary_parts)

def generate_pdf(commits, output_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Titre
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    )
    elements.append(Paragraph("Rapport des Commits de la Semaine", title_style))
    
    # Ajouter le résumé
    summary_style = ParagraphStyle(
        'SummaryStyle',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,  # Augmenter l'espacement des lignes
        spaceBefore=20,
        spaceAfter=30,
        borderWidth=1,
        borderColor=colors.grey,
        borderPadding=15,  # Augmenter le padding
        backColor=colors.lightgrey,
        textColor=colors.black
    )
    
    summary_text = generate_summary(commits)
    # Remplacer les retours à la ligne par des balises HTML
    summary_text = summary_text.replace('\n', '<br/>')
    elements.append(Paragraph(summary_text, summary_style))
    
    # Sous-titre pour la liste des commits
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceBefore=20,
        spaceAfter=20
    )
    elements.append(Paragraph("Liste détaillée des commits", subtitle_style))
    
    # Style pour les messages de commit
    message_style = ParagraphStyle(
        'MessageStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        alignment=0,  # 0 = gauche
        spaceAfter=6,
        spaceBefore=6
    )
    
    # Créer le tableau des commits
    data = [['Date', 'Message']]
    for commit in commits:
        # Formater le message avec une meilleure mise en forme des listes
        formatted_message = format_commit_message(commit['message'])
        message = Paragraph(formatted_message, message_style)
        data.append([commit['date'], message])
    
    table = Table(data, colWidths=[120, 420])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),  # Alignement en haut pour les cellules
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(table)
    doc.build(elements)

if __name__ == "__main__":
    # Chemin vers votre repository (à modifier selon votre cas)
    repo_path = "."
    
    # Chemin de sortie pour le PDF
    output_path = "commits_report.pdf"
    
    # Récupérer les commits
    commits = get_weekly_commits(repo_path)
    
    # Générer le PDF
    generate_pdf(commits, output_path)
    print(f"Rapport généré avec succès : {output_path}") 