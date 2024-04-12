import { Kafka } from 'kafkajs';
import { TransactionStatusEnum } from '../shared/transaction-status.enum';
import { TopicsEnum } from '../shared/topics.enum';

// Configuración de Kafka
const kafka = new Kafka({
  clientId: 'fraud',
  brokers: [process.env.ANTIFRAUD_MICROSERVICE_SERVER], // Especifica los brokers de Kafka
});

// Crea un nuevo consumidor
const consumer = kafka.consumer({ groupId: 'anti-fraud-consumer' });
const producer = kafka.producer();

// Función para conectarse al clúster de Kafka y suscribirse a un topic
export const runFraudMicroservice = async () => {
  // Conecta el producer y consumer al clúster de Kafka
  await consumer.connect();
  await producer.connect();

  // Suscribe el consumidor a uno o más topics
  await consumer.subscribe({
    topic: TopicsEnum.TRANSACTION_CREATED,
    fromBeginning: true,
  });

  // Maneja los mensajes recibidos
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageObj = JSON.parse(message.value.toString());

      let statusName = TransactionStatusEnum.REJECTED;
      if (messageObj.value <= 1000) {
        statusName = TransactionStatusEnum.APPROVED;
      }

      try {
        const result = await producer.send({
          topic: TopicsEnum.TRANSACTION_STATUS,
          messages: [
            {
              value: JSON.stringify({
                transactionId: messageObj.transactionId,
                status: { name: statusName },
              }),
            },
          ],
        });
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    },
  });
};
