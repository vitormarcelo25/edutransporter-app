package io.github.David_Rn01.API_OFC.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "viagem")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String nomeRota;

    @Enumerated(EnumType.STRING)
    @Column
    private TipoViagem tipoViagem;

    @Column
    private LocalDate data;

    @Column
    private LocalTime horario;

    @ManyToOne
    @JoinColumn(name = "motorista_cpf")
    private Motorista motorista;

    @ManyToOne
    @JoinColumn(name = "veiculo_id")
    private Veiculo veiculo;
}
