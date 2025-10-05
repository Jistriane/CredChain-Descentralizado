import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditScore } from '../../types/dashboard';

interface ScoreCardProps {
  score: CreditScore;
}

const { width } = Dimensions.get('window');

export default function ScoreCard({ score }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 800) return '#4CAF50'; // Green
    if (score >= 700) return '#FF9800'; // Orange
    if (score >= 600) return '#FF5722'; // Red-Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excelente';
    if (score >= 700) return 'Bom';
    if (score >= 600) return 'Regular';
    return 'Ruim';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 800) return 'Você tem um excelente histórico de crédito!';
    if (score >= 700) return 'Seu score está bom, continue assim!';
    if (score >= 600) return 'Há espaço para melhorar seu score.';
    return 'Foque em pagar suas contas em dia.';
  };

  const progress = score.score / 1000;
  const scoreColor = getScoreColor(score.score);
  const scoreLabel = getScoreLabel(score.score);
  const scoreDescription = getScoreDescription(score.score);

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={[scoreColor, `${scoreColor}CC`]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Seu Score de Crédito</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score.score}</Text>
            <Text style={styles.maxScore}>/1000</Text>
          </View>
          
          <Text style={styles.label}>{scoreLabel}</Text>
          <Text style={styles.description}>{scoreDescription}</Text>
          
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              color="white"
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.factorsContainer}>
            <Text style={styles.factorsTitle}>Fatores Positivos:</Text>
            {score.positiveFactors.map((factor, index) => (
              <Text key={index} style={styles.factor}>
                ✅ {factor}
              </Text>
            ))}
          </View>
          
          {score.improvementTips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Dicas para Melhorar:</Text>
              {score.improvementTips.map((tip, index) => (
                <Text key={index} style={styles.tip}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  maxScore: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  factorsContainer: {
    width: '100%',
    marginBottom: 15,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  factor: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  tipsContainer: {
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
});
